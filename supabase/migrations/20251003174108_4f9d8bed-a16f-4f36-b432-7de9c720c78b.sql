-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT,
  income_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create expenses table
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for expenses
CREATE POLICY "Users can view their own expenses" 
ON public.expenses FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own expenses" 
ON public.expenses FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses" 
ON public.expenses FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses" 
ON public.expenses FOR DELETE 
USING (auth.uid() = user_id);

-- Create pricing_calculations table
CREATE TABLE public.pricing_calculations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  hours_worked DECIMAL(10,2) NOT NULL,
  hourly_rate DECIMAL(10,2) NOT NULL,
  material_cost DECIMAL(10,2) NOT NULL,
  profit_margin DECIMAL(5,2) NOT NULL,
  recommended_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pricing_calculations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pricing_calculations
CREATE POLICY "Users can view their own calculations" 
ON public.pricing_calculations FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own calculations" 
ON public.pricing_calculations FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create learning_content table
CREATE TABLE public.learning_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.learning_content ENABLE ROW LEVEL SECURITY;

-- RLS Policies for learning_content (public read)
CREATE POLICY "Anyone can view learning content" 
ON public.learning_content FOR SELECT 
USING (true);

-- Create forum_posts table
CREATE TABLE public.forum_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tags TEXT[],
  upvotes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for forum_posts
CREATE POLICY "Anyone can view forum posts" 
ON public.forum_posts FOR SELECT 
USING (true);

CREATE POLICY "Users can create forum posts" 
ON public.forum_posts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" 
ON public.forum_posts FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" 
ON public.forum_posts FOR DELETE 
USING (auth.uid() = user_id);

-- Create forum_comments table
CREATE TABLE public.forum_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.forum_posts ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for forum_comments
CREATE POLICY "Anyone can view comments" 
ON public.forum_comments FOR SELECT 
USING (true);

CREATE POLICY "Users can create comments" 
ON public.forum_comments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.forum_comments FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.forum_comments FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function for updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for learning_content updated_at
CREATE TRIGGER update_learning_content_updated_at
BEFORE UPDATE ON public.learning_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default learning content
INSERT INTO public.learning_content (title, description, content, tags) VALUES
('Understanding GST for Freelancers', 
 'Learn how GST registration works for freelance artists and designers in India',
 '# GST for Freelancers\n\n## What is GST?\nGoods and Services Tax (GST) is an indirect tax levied on the supply of goods and services in India.\n\n## Do I need to register?\n- If your annual turnover exceeds ₹20 lakhs (₹10 lakhs for special category states), GST registration is mandatory\n- For exports, registration is required regardless of turnover\n\n## How to Register\n1. Visit gst.gov.in\n2. Choose "Register as Individual"\n3. Submit PAN, Aadhaar, bank details\n4. Receive GSTIN within 3-7 days\n\n## Filing Returns\n- GSTR-1: Monthly/quarterly outward supplies\n- GSTR-3B: Monthly summary return\n- Due dates vary based on turnover',
 ARRAY['tax', 'GST', 'registration']),

('Pricing Your Creative Work', 
 'A comprehensive guide to pricing strategies for artists and designers',
 '# Pricing Your Creative Work\n\n## Cost-Based Pricing\nCalculate your costs and add desired profit margin:\n- Materials + Time + Overhead + Profit = Price\n\n## Value-Based Pricing\nPrice based on the value you provide to clients:\n- Research market rates\n- Consider client budget\n- Factor in your expertise\n\n## Common Mistakes to Avoid\n1. Underpricing your work\n2. Not accounting for revision time\n3. Forgetting overhead costs\n4. Not adjusting for experience level\n\n## Tips\n- Always have a written agreement\n- Request 30-50% advance\n- Set clear payment terms\n- Build in buffer time for revisions',
 ARRAY['pricing', 'business', 'freelancing']),

('Managing Irregular Income', 
 'Strategies for financial planning when income varies month to month',
 '# Managing Irregular Income\n\n## Build an Emergency Fund\n- Aim for 6-12 months of expenses\n- Start with 1 month and build gradually\n\n## Budget Based on Minimum Income\n- Calculate your lowest earning month\n- Cover essentials within that amount\n- Treat extra income as bonus\n\n## Income Smoothing\n1. Open a business savings account\n2. During high-earning months, save excess\n3. During low months, draw from savings\n\n## Track Everything\n- Use expense tracking apps\n- Categorize all expenses\n- Review monthly trends\n- Adjust budget quarterly\n\n## Tax Planning\n- Set aside 30% for taxes\n- Make quarterly advance tax payments\n- Maintain organized records',
 ARRAY['budgeting', 'income', 'savings']);
