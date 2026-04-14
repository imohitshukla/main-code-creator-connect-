import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";

function Hero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => [
      "brand collaborations.",
      "influencer marketing.",
      "barter deals.",
      "creator sourcing.",
      "paid campaigns."
    ],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden animate-fade-in">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex gap-8 items-center justify-center flex-col relative z-10">
          <div>
          </div>
          <div className="flex gap-4 flex-col">
            <h1 className="text-5xl md:text-7xl max-w-4xl tracking-tight text-center font-bold text-foreground leading-[1.1]">
              <span className="text-foreground">A marketplace for</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1 text-primary">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-bold text-primary"
                    initial={{ opacity: 0, y: "-100" }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? {
                            y: 0,
                            opacity: 1,
                          }
                        : {
                            y: titleNumber > index ? -150 : 150,
                            opacity: 0,
                          }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-center animate-fade-in-delay-1 mt-8">
              Find creators, run deals, and track approvals — all in one place.
              <br />
              <strong className="text-foreground"> Zero agency fees. Zero WhatsApp chaos.</strong>
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-fade-in-delay-2">
            <Button asChild size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg hover:shadow-primary/25 transition-all gap-2">
              <a href="https://calendly.com/creatorconnect/15min" target="_blank" rel="noopener noreferrer">
                Book a 15-min Demo <MoveRight className="w-5 h-5" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full">
              <a href="/filter">Browse Creators</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero };
