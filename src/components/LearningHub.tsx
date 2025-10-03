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
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BookOpen className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Learning Hub</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contents.map((content) => (
          <Card
            key={content.id}
            className="p-6 shadow-card hover:shadow-card-hover transition-shadow cursor-pointer group"
            onClick={() => setSelectedContent(content)}
          >
            <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
              {content.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {content.description}
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {content.tags?.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
              Read More
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedContent} onOpenChange={() => setSelectedContent(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedContent?.title}</DialogTitle>
          </DialogHeader>
          <div className="prose prose-sm max-w-none mt-4">
            <div className="whitespace-pre-wrap">{selectedContent?.content}</div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {selectedContent?.tags?.map((tag) => (
              <Badge key={tag} variant="secondary">
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
