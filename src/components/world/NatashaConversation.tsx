import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { NATASHA_GREETING, replyAsNatasha } from "./natasha-conversation";

type Exchange = { question: string; answer: string };

export function NatashaConversation({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  const [message, setMessage] = useState("");
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const log = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [exchanges]);

  function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = message.trim();
    if (!question) return;
    setExchanges((previous) => [...previous, { question, answer: replyAsNatasha(question) }]);
    setMessage("");
  }

  return (
    <Dialog onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg" className="bg-[#f4b76d] text-[#15151a] hover:bg-[#ffcc9b]">Parler à Natasha</Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100%-1.5rem)] max-h-[85dvh] overflow-y-auto rounded-lg border-[#334656] bg-[#101923] p-4 text-[#f9e9d9] sm:p-6">
        <DialogHeader className="pr-6 text-left">
          <DialogTitle>Natasha</DialogTitle>
          <DialogDescription className="text-[#d4c6b9]">Conversation de démonstration · réponses locales</DialogDescription>
        </DialogHeader>
        <div ref={log} role="log" aria-label="Conversation avec Natasha" className="max-h-[38dvh] space-y-3 overflow-y-auto">
          <p><strong>Natasha</strong> · {NATASHA_GREETING}</p>
          {exchanges.map(({ question, answer }, index) => (
            <div key={index} className="space-y-2 break-words">
              <p className="rounded bg-[#263746] p-2"><strong>Toi</strong> · {question}</p>
              <p><strong>Natasha</strong> · {answer}</p>
            </div>
          ))}
        </div>
        <form onSubmit={send} className="space-y-2">
          <label htmlFor="natasha-message" className="block text-sm">Ton message</label>
          <div className="flex gap-2">
            <input
              id="natasha-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              maxLength={300}
              placeholder="Que se passe-t-il à Rotas ?"
              className="h-11 min-w-0 flex-1 rounded border border-[#526576] bg-[#182638] px-2 text-base"
            />
            <Button type="submit" size="lg" disabled={!message.trim()} className="bg-[#f4b76d] px-3 text-[#15151a] hover:bg-[#ffcc9b]">Envoyer</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
