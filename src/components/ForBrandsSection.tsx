import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const benefits = [
  {
    title: "Proven Performance",
    description: "Track record of delivering measurable results across awareness and conversion campaigns",
  },
  {
    title: "Multi-Month Partnerships",
    description: "Average 3-month contracts delivering sustained impact and brand loyalty",
  },
  {
    title: "Strategic Support",
    description: "Content strategy, scripting, psychological selling techniques, and performance optimization",
  },
  {
    title: "Scalable Solutions",
    description: "We work with emerging brands and enterprise clients alike",
  },
  {
    title: "Authentic Partnerships",
    description: "Only creators who genuinely align with your brand values and marketing objectives",
  },
];

const ForBrandsSection = () => {
  return (
    <section id="brands" className="section-padding bg-primary text-primary-foreground">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div>
              <h2 className="font-serif text-3xl md:text-5xl font-bold mb-4">
                For <span className="italic text-accent">Brands</span>
              </h2>
              <p className="text-primary-foreground/80 text-lg mb-8">
                Why Choose Eight-Six?
              </p>

              <div className="space-y-5 mb-10">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-6 h-6 bg-accent rounded-full flex items-center justify-center mt-0.5">
                      <Check className="w-4 h-4 text-accent-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary-foreground mb-1">
                        {benefit.title}
                      </h4>
                      <p className="text-primary-foreground/70 text-sm">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <blockquote className="italic text-primary-foreground/90 text-lg mb-8 border-l-4 border-accent pl-4">
                "Ready to maximize your creator marketing impact?"
              </blockquote>

              <Button
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90 font-medium"
                onClick={() => window.open("https://calendly.com", "_blank")}
              >
                Schedule a Call with Elizabeth
              </Button>
            </div>

            {/* Visual element - elegant typography */}
            <div className="flex items-center justify-center lg:justify-end">
              <div className="relative text-center lg:text-right">
                <span className="font-serif text-8xl md:text-9xl font-light text-accent leading-none tracking-tight">
                  8.6
                </span>
                <div className="mt-2">
                  <p className="font-serif text-xl md:text-2xl italic text-primary-foreground/90">
                    heartbeats
                  </p>
                  <p className="text-sm text-primary-foreground/60 mt-1">
                    to make a lasting impression
                  </p>
                </div>
                <div className="w-12 h-px bg-accent mt-4 mx-auto lg:ml-auto lg:mr-0" />
                <p className="text-accent text-sm font-medium mt-3 tracking-wide uppercase">
                  We help you make them count
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForBrandsSection;
