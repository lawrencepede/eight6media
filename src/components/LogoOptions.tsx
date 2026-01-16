import logo1 from "@/assets/logo-option-1.png";
import logo2 from "@/assets/logo-option-2.png";
import logo3 from "@/assets/logo-option-3.png";

const LogoOptions = () => {
  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm overflow-auto p-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-serif font-bold text-primary mb-8 text-center">
          Choose Your Logo Option
        </h2>
        <div className="grid gap-8">
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-primary">Option 1 - Clean Typography</h3>
            <img src={logo1} alt="Logo Option 1" className="w-full max-w-md mx-auto" />
          </div>
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-primary">Option 2 - Partnership Circles Icon</h3>
            <img src={logo2} alt="Logo Option 2" className="w-full max-w-md mx-auto" />
          </div>
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-primary">Option 3 - Star Icon</h3>
            <img src={logo3} alt="Logo Option 3" className="w-full max-w-md mx-auto" />
          </div>
        </div>
        <p className="text-center text-muted-foreground mt-8">
          Tell me which option you prefer and I'll apply it to the site!
        </p>
      </div>
    </div>
  );
};

export default LogoOptions;