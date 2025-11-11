import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, ThumbsUp, Plus, Send } from "lucide-react";

interface ForumPost {
  id: string;
  author_name: string;
  title: string;
  description: string;
  tags: string[];
  upvotes: number;
  created_at: string;
}

interface Comment {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
}

const CommunityForum = ({ userId, userName }: { userId: string; userName: string }) => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [commentText, setCommentText] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (selectedPost) {
      fetchComments(selectedPost.id);
    }
  }, [selectedPost]);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("forum_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setPosts(data);
  };

  const fetchComments = async (postId: string) => {
    const { data } = await supabase
      .from("forum_comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (data) setComments(data);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("forum_posts").insert({
      user_id: userId,
      author_name: userName,
      title,
      description,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    });

    if (error) {
      toast({ title: "Error creating post", variant: "destructive" });
    } else {
      toast({ title: "Post created!" });
      setTitle("");
      setDescription("");
      setTags("");
      setDialogOpen(false);
      fetchPosts();
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPost) return;

    const { error } = await supabase.from("forum_comments").insert({
      post_id: selectedPost.id,
      user_id: userId,
      author_name: userName,
      content: commentText,
    });

    if (error) {
      toast({ title: "Error adding comment", variant: "destructive" });
    } else {
      toast({ title: "Comment added!" });
      setCommentText("");
      fetchComments(selectedPost.id);
    }
  };

  const handleUpvote = async (postId: string, currentUpvotes: number) => {
    const { error } = await supabase
      .from("forum_posts")
      .update({ upvotes: currentUpvotes + 1 })
      .eq("id", postId);

    if (!error) {
      fetchPosts();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-primary/10 backdrop-blur-sm">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-heading font-bold">Community Forum</h2>
            <p className="text-sm text-muted-foreground">Connect, share, and learn together</p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="hover:scale-105 transition-transform shadow-glow">
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-heading">Create a New Post</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="post-title">Title</Label>
                <Input
                  id="post-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Ask a question or share a tip..."
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="post-desc">Description</Label>
                <Textarea
                  id="post-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  placeholder="Provide details..."
                  rows={4}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="post-tags">Tags (comma-separated)</Label>
                <Input
                  id="post-tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="pricing, tax, marketing"
                  className="rounded-xl"
                />
              </div>
              <Button type="submit" className="w-full">
                Create Post
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-5">
        {posts.map((post) => (
          <Card
            key={post.id}
            className="artistic-card hover-lift cursor-pointer group overflow-hidden"
            onClick={() => setSelectedPost(post)}
          >
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="flex gap-6 p-6">
              <div className="flex flex-col items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpvote(post.id, post.upvotes);
                  }}
                  className="hover:bg-primary/10 rounded-xl transition-all hover:scale-110"
                >
                  <ThumbsUp className="h-5 w-5 text-primary" />
                </Button>
                <span className="text-base font-bold text-primary">{post.upvotes}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-heading font-semibold mb-3 group-hover:text-primary transition-colors">{post.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{post.description}</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs text-muted-foreground font-medium">by {post.author_name}</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                  {post.tags?.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs rounded-full border-primary/30">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading">{selectedPost?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">{selectedPost?.description}</p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => selectedPost && handleUpvote(selectedPost.id, selectedPost.upvotes)}
                className="rounded-xl"
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                {selectedPost?.upvotes}
              </Button>
              <span className="text-xs text-muted-foreground">by {selectedPost?.author_name}</span>
            </div>

            <div className="border-t pt-6">
              <h4 className="font-heading font-semibold text-lg mb-4">Comments ({comments.length})</h4>
              <div className="space-y-3 mb-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-muted/50 p-4 rounded-xl backdrop-blur-sm">
                    <p className="text-sm leading-relaxed">{comment.content}</p>
                    <p className="text-xs text-muted-foreground mt-3">
                      {comment.author_name} • {new Date(comment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
              <form onSubmit={handleAddComment} className="flex gap-3">
                <Input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  required
                  className="rounded-xl"
                />
                <Button type="submit" size="sm" className="rounded-xl">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommunityForum;
