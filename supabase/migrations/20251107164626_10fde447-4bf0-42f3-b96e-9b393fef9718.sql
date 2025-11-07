-- Create table for advanced art valuations with sentimental analysis
CREATE TABLE public.art_valuations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  artwork_title TEXT NOT NULL,
  artwork_description TEXT NOT NULL,
  materials_used TEXT NOT NULL,
  time_spent NUMERIC NOT NULL,
  expected_outcome TEXT,
  actual_feelings TEXT,
  previous_artwork_data TEXT,
  client_feedback TEXT,
  
  -- LLM Analysis Results
  objective_value NUMERIC,
  subjective_value NUMERIC,
  sentimental_score NUMERIC,
  market_comparison TEXT,
  emotional_analysis TEXT,
  expectations_gap TEXT,
  recommendations TEXT,
  full_analysis JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.art_valuations ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own valuations" 
ON public.art_valuations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own valuations" 
ON public.art_valuations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own valuations" 
ON public.art_valuations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own valuations" 
ON public.art_valuations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_art_valuations_updated_at
BEFORE UPDATE ON public.art_valuations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();