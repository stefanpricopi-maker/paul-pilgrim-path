-- Update Barnabas character to use the same image approach as Silas
UPDATE characters 
SET face_image_url = '/barnabas_small.png'
WHERE name = 'Barnabas';