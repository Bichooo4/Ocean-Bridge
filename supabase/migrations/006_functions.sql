-- Migration 006: Atomic booking creation function
-- Wraps capacity check + insert in a single transaction with row lock
-- to prevent race conditions under concurrent requests.

CREATE OR REPLACE FUNCTION public.create_booking(
  p_trip_id         uuid,
  p_company_id      uuid,
  p_containers      jsonb,
  p_total_weight_kg numeric,
  p_total_price     numeric,
  p_notes           text DEFAULT null
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_trip          trips%ROWTYPE;
  v_current_count integer;
  v_new_count     integer;
  v_booking_id    uuid;
  v_container     jsonb;
BEGIN
  -- Lock the trip row to prevent race conditions
  SELECT * INTO v_trip FROM trips WHERE id = p_trip_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Trip not found';
  END IF;

  IF v_trip.status NOT IN ('open', 'full') THEN
    RAISE EXCEPTION 'Trip is not available for booking';
  END IF;

  -- Count existing non-cancelled containers on this trip
  SELECT COUNT(*) INTO v_current_count
  FROM containers c
  JOIN bookings b ON b.id = c.booking_id
  WHERE b.trip_id = p_trip_id
    AND b.status  != 'cancelled';

  v_new_count := v_current_count + jsonb_array_length(p_containers);

  IF v_new_count > v_trip.max_containers THEN
    RAISE EXCEPTION 'Trip capacity exceeded: % slot(s) available, % requested',
      (v_trip.max_containers - v_current_count),
      jsonb_array_length(p_containers);
  END IF;

  -- Check for duplicate booking (same company + trip)
  IF EXISTS (
    SELECT 1 FROM bookings
    WHERE trip_id    = p_trip_id
      AND company_id = p_company_id
      AND status    != 'cancelled'
  ) THEN
    RAISE EXCEPTION 'You already have an active booking on this trip';
  END IF;

  -- Insert booking
  INSERT INTO bookings (trip_id, company_id, status, total_weight_kg, total_price, notes)
  VALUES (p_trip_id, p_company_id, 'pending', p_total_weight_kg, p_total_price, p_notes)
  RETURNING id INTO v_booking_id;

  -- Insert containers
  FOR v_container IN SELECT * FROM jsonb_array_elements(p_containers)
  LOOP
    INSERT INTO containers (booking_id, weight_kg, description)
    VALUES (
      v_booking_id,
      (v_container->>'weight_kg')::numeric,
      NULLIF(v_container->>'description', '')
    );
  END LOOP;

  -- Insert initial status history
  INSERT INTO booking_status_history (booking_id, updated_by, status, notes)
  VALUES (v_booking_id, null, 'pending', 'Booking created');

  -- Update trip to 'full' if capacity reached
  IF v_new_count >= v_trip.max_containers THEN
    UPDATE trips SET status = 'full' WHERE id = p_trip_id;
  END IF;

  RETURN jsonb_build_object('booking_id', v_booking_id);
END;
$$;

-- Grant execute to authenticated users (RLS enforces company check in the API)
GRANT EXECUTE ON FUNCTION public.create_booking(uuid, uuid, jsonb, numeric, numeric, text)
  TO authenticated;
