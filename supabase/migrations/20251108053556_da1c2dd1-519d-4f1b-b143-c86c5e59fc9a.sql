-- Create creative_health_scores table to track artist's creative wellness
CREATE TABLE public.creative_health_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  overall_score NUMERIC NOT NULL DEFAULT 50,
  productivity_score NUMERIC NOT NULL DEFAULT 50,
  financial_health_score NUMERIC NOT NULL DEFAULT 50,
  learning_engagement_score NUMERIC NOT NULL DEFAULT 50,
  community_participation_score NUMERIC NOT NULL DEFAULT 50,
  last_calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.creative_health_scores ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own health scores"
ON public.creative_health_scores
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health scores"
ON public.creative_health_scores
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health scores"
ON public.creative_health_scores
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_creative_health_scores_updated_at
BEFORE UPDATE ON public.creative_health_scores
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create mentor_conversations table for AI mentor chat history
CREATE TABLE public.mentor_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mentor_conversations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own mentor conversations"
ON public.mentor_conversations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mentor messages"
ON public.mentor_conversations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mentor conversations"
ON public.mentor_conversations
FOR DELETE
USING (auth.uid() = user_id);

-- Create funding_recommendations table
CREATE TABLE public.funding_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  grant_name TEXT NOT NULL,
  organization TEXT NOT NULL,
  amount_range TEXT NOT NULL,
  deadline TEXT,
  eligibility TEXT NOT NULL,
  description TEXT NOT NULL,
  application_url TEXT,
  match_score NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.funding_recommendations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own funding recommendations"
ON public.funding_recommendations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own funding recommendations"
ON public.funding_recommendations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own funding recommendations"
ON public.funding_recommendations
FOR DELETE
USING (auth.uid() = user_id);