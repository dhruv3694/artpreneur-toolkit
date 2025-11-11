import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ArrowRight } from "lucide-react";

interface LearningContent {
  id: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
}

const LearningHub = () => {
  const [contents, setContents] = useState<LearningContent[]>([]);
  const [selectedContent, setSelectedContent] = useState<LearningContent | null>(null);

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    const { data } = await supabase
      .from("learning_content")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setContents(data);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-3 rounded-xl bg-gradient-primary/10 backdrop-blur-sm">
          <BookOpen className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-3xl font-heading font-bold">Learning Hub</h2>
          <p className="text-sm text-muted-foreground mt-1">Expand your creative business knowledge</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contents.map((content) => (
          <Card
            key={content.id}
            className="artistic-card hover-lift cursor-pointer group overflow-hidden"
            onClick={() => setSelectedContent(content)}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-primary opacity-10 rounded-bl-[100px] -mr-12 -mt-12 group-hover:opacity-20 transition-opacity"></div>
            <div className="p-8 relative">
              <h3 className="text-xl font-heading font-semibold mb-3 group-hover:text-primary transition-colors leading-tight">
                {content.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-5 leading-relaxed line-clamp-3">
                {content.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-5">
                {content.tags?.map((tag) => (
                  <Badge key={tag} variant="secondary" className="rounded-full text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full group-hover:bg-gradient-primary group-hover:text-white group-hover:border-transparent transition-all rounded-xl">
                Read More
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedContent} onOpenChange={() => setSelectedContent(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-heading">{selectedContent?.title}</DialogTitle>
          </DialogHeader>
          <div className="prose prose-sm max-w-none mt-6">
            <div className="whitespace-pre-wrap leading-relaxed text-muted-foreground">{selectedContent?.content}</div>
          </div>
          <div className="flex flex-wrap gap-2 mt-6">
            {selectedContent?.tags?.map((tag) => (
              <Badge key={tag} variant="secondary" className="rounded-full">
                {tag}
              </Badge>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LearningHub;
