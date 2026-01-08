-- Create collections/sections table
CREATE TABLE public.collections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    title_en text NOT NULL,
    description text,
    description_en text,
    sort_order integer NOT NULL DEFAULT 0,
    status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on collections
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

-- RLS policies for collections
CREATE POLICY "Collections are publicly viewable when published" 
ON public.collections 
FOR SELECT 
USING (status = 'published' OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage collections" 
ON public.collections 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- Create collection_videos table (1 video per collection)
CREATE TABLE public.collection_videos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id uuid REFERENCES public.collections(id) ON DELETE CASCADE NOT NULL UNIQUE,
    title text NOT NULL,
    title_en text,
    description text,
    description_en text,
    video_url text NOT NULL,
    cover_url text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on collection_videos
ALTER TABLE public.collection_videos ENABLE ROW LEVEL SECURITY;

-- RLS policies for collection_videos
CREATE POLICY "Videos are publicly viewable" 
ON public.collection_videos 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage videos" 
ON public.collection_videos 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- Add collection_id to artworks table
ALTER TABLE public.artworks 
ADD COLUMN collection_id uuid REFERENCES public.collections(id) ON DELETE SET NULL,
ADD COLUMN visibility text NOT NULL DEFAULT 'visible' CHECK (visibility IN ('visible', 'hidden')),
ADD COLUMN sort_order integer NOT NULL DEFAULT 0;

-- Create index for better performance
CREATE INDEX idx_artworks_collection ON public.artworks(collection_id);
CREATE INDEX idx_collections_sort ON public.collections(sort_order);
CREATE INDEX idx_artworks_sort ON public.artworks(sort_order);

-- Add trigger for updated_at on collections
CREATE TRIGGER update_collections_updated_at
BEFORE UPDATE ON public.collections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for updated_at on collection_videos
CREATE TRIGGER update_collection_videos_updated_at
BEFORE UPDATE ON public.collection_videos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create site_settings table for SEO
CREATE TABLE public.site_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    meta_title text,
    meta_title_en text,
    meta_description text,
    meta_description_en text,
    og_image_url text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for site_settings
CREATE POLICY "Site settings are publicly viewable" 
ON public.site_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage site settings" 
ON public.site_settings 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- Insert default site settings
INSERT INTO public.site_settings (meta_title, meta_title_en, meta_description, meta_description_en)
VALUES ('Luna Gallery', 'Luna Gallery', 'Галерея современного искусства художницы Luna', 'Contemporary art gallery by Luna');

-- Add trigger for updated_at on site_settings
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();