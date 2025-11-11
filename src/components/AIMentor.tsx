import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Send, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  role: "user" | "assistant";
  content: string;
  created_at?: string;
}

const AIMentor = ({ userId, userProfile }: { userId: string; userProfile?: any }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchConversationHistory = async () => {
    const { data, error } = await supabase
      .from("mentor_conversations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(50);

    if (error) {
      console.error("Error fetching conversation:", error);
      return;
    }

    if (data) {
      setMessages(data.map(msg => ({
        role: msg.role as "user" | "assistant",
        content: msg.message,
        created_at: msg.created_at,
      })));
    }
  };

  useEffect(() => {
    fetchConversationHistory();
  }, [userId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    // Add user message to UI immediately
    const newUserMessage: Message = { role: "user", content: userMessage };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      // Save user message to database
      await supabase.from("mentor_conversations").insert({
        user_id: userId,
        message: userMessage,
        role: "user",
      });

      // Get AI response
      const { data, error } = await supabase.functions.invoke("ai-mentor", {
        body: {
          message: userMessage,
          conversationHistory: messages.slice(-10), // Last 10 messages for context
          userProfile,
        },
      });

      if (error) throw error;

      if (data?.reply) {
        const assistantMessage: Message = { role: "assistant", content: data.reply };
        setMessages(prev => [...prev, assistantMessage]);

        // Save assistant message to database
        await supabase.from("mentor_conversations").insert({
          user_id: userId,
          message: data.reply,
          role: "assistant",
        });
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = async () => {
    try {
      await supabase
        .from("mentor_conversations")
        .delete()
        .eq("user_id", userId);

      setMessages([]);
      toast({ title: "Conversation cleared" });
    } catch (error: any) {
      toast({
        title: "Failed to clear conversation",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="shadow-card hover-lift h-[650px] flex flex-col overflow-hidden rounded-3xl">
      <div className="flex items-center justify-between p-8 pb-4 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-primary/10 backdrop-blur-sm">
            <MessageCircle className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-heading font-bold">AI Creative Mentor</h2>
            <p className="text-xs text-muted-foreground mt-1">Your personal guide to creative success</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearConversation} className="rounded-xl hover:bg-destructive/10">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 pr-4 px-8" ref={scrollRef}>
        <div className="space-y-5 py-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 rounded-2xl bg-gradient-primary/10 backdrop-blur-sm w-fit mx-auto mb-4">
                <MessageCircle className="h-16 w-16 text-primary opacity-70 animate-float" />
              </div>
              <p className="text-lg font-heading mb-2">Start Your Creative Journey</p>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Ask about pricing strategies, overcoming creative blocks, marketing tips, or anything else!
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-slide-up`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-5 shadow-soft ${
                    message.role === "user"
                      ? "bg-gradient-primary text-primary-foreground"
                      : "bg-muted/50 backdrop-blur-sm"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-muted/50 backdrop-blur-sm rounded-2xl p-5 shadow-soft">
                <div className="flex space-x-2">
                  <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" />
                  <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="flex gap-3 p-8 pt-4 bg-gradient-to-r from-primary/5 to-accent/5">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask your mentor anything..."
          disabled={isLoading}
          className="rounded-xl shadow-soft"
        />
        <Button onClick={handleSend} disabled={isLoading || !input.trim()} className="rounded-xl shadow-glow">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

export default AIMentor;
