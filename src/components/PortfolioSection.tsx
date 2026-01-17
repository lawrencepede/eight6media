import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Play, X } from "lucide-react";

interface PortfolioItem {
  id: number;
  brand: string;
  talent: string;
  thumbnail: string;
  videoUrl?: string;
}

const portfolioItems: PortfolioItem[] = [
  {
    id: 1,
    brand: "NOBULL",
    talent: "Joey Mucchio",
    thumbnail: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=711&fit=crop",
  },
  {
    id: 2,
    brand: "Garmin",
    talent: "Sarah Chen",
    thumbnail: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=711&fit=crop",
  },
  {
    id: 3,
    brand: "Nike",
    talent: "Marcus Williams",
    thumbnail: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&h=711&fit=crop",
  },
  {
    id: 4,
    brand: "Lululemon",
    talent: "Emma Rodriguez",
    thumbnail: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=711&fit=crop",
  },
  {
    id: 5,
    brand: "Whoop",
    talent: "David Park",
    thumbnail: "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=400&h=711&fit=crop",
  },
  {
    id: 6,
    brand: "Apple",
    talent: "Lisa Thompson",
    thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=711&fit=crop",
  },
];

const PhoneMockup = ({ 
  item, 
  onClick 
}: { 
  item: PortfolioItem; 
  onClick: () => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Phone Frame */}
      <div className="relative mx-auto w-[180px] md:w-[200px] lg:w-[220px]">
        {/* Phone outer shell */}
        <div className="relative bg-zinc-900 rounded-[2.5rem] p-2 shadow-2xl transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-2">
          {/* Dynamic Island / Notch */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-6 bg-black rounded-full z-20" />
          
          {/* Screen */}
          <div className="relative overflow-hidden rounded-[2rem] bg-black aspect-[9/19.5]">
            {/* Video/Image Content */}
            <img
              src={item.thumbnail}
              alt={`${item.brand} x ${item.talent}`}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
            
            {/* Play Button Overlay */}
            <div 
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                <Play className="w-8 h-8 text-white fill-white ml-1" />
              </div>
            </div>
            
            {/* Brand x Talent Label */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-white text-center font-medium text-sm tracking-wide">
                <span className="font-bold">{item.brand}</span>
                <span className="text-white/70 mx-2">×</span>
                <span className="italic">{item.talent}</span>
              </p>
            </div>
          </div>
        </div>
        
        {/* Reflection/Glow Effect */}
        <div className="absolute -inset-4 bg-gradient-to-b from-accent/20 to-transparent rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl" />
      </div>
    </div>
  );
};

const PortfolioSection = () => {
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

  return (
    <section className="py-24 md:py-32 bg-secondary/30">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-accent font-medium tracking-widest uppercase text-sm mb-4">
            Our Work
          </p>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6">
            Featured <span className="italic">Collaborations</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            A showcase of authentic partnerships between leading brands and our roster of creators.
          </p>
        </div>

        {/* Phone Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8">
          {portfolioItems.map((item) => (
            <PhoneMockup
              key={item.id}
              item={item}
              onClick={() => setSelectedItem(item)}
            />
          ))}
        </div>

        {/* View More Link */}
        <div className="text-center mt-16">
          <button className="inline-flex items-center gap-2 text-primary font-medium hover:text-accent transition-colors group">
            View all work
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </div>

      {/* Modal for Full View */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-sm p-0 bg-transparent border-none shadow-none">
          {selectedItem && (
            <div className="relative">
              {/* Close Button */}
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors"
              >
                <X className="w-8 h-8" />
              </button>
              
              {/* Large Phone Frame */}
              <div className="relative bg-zinc-900 rounded-[3rem] p-3 shadow-2xl">
                <div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-7 bg-black rounded-full z-20" />
                
                <div className="relative overflow-hidden rounded-[2.5rem] bg-black aspect-[9/19.5]">
                  <img
                    src={selectedItem.thumbnail}
                    alt={`${selectedItem.brand} x ${selectedItem.talent}`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 cursor-pointer hover:bg-white/30 transition-colors">
                      <Play className="w-10 h-10 text-white fill-white ml-1" />
                    </div>
                  </div>
                  
                  {/* Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="text-white text-center font-medium text-lg tracking-wide">
                      <span className="font-bold">{selectedItem.brand}</span>
                      <span className="text-white/70 mx-2">×</span>
                      <span className="italic">{selectedItem.talent}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default PortfolioSection;
