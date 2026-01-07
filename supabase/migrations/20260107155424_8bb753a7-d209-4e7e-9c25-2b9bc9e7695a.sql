-- Create artwork_images table for multiple images per artwork
CREATE TABLE public.artwork_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artwork_id UUID NOT NULL REFERENCES public.artworks(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.artwork_images ENABLE ROW LEVEL SECURITY;

-- Public can view images
CREATE POLICY "Artwork images are publicly viewable" 
ON public.artwork_images 
FOR SELECT 
USING (true);

-- Admins can manage images
CREATE POLICY "Admins can manage artwork images" 
ON public.artwork_images 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add index for faster lookups
CREATE INDEX idx_artwork_images_artwork_id ON public.artwork_images(artwork_id);

-- Update artworks status to support more values (sold, reserved, for_sale)
-- No schema change needed as status is already TEXT