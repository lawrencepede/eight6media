import ForBrandsSection from "@/components/ForBrandsSection";
import ApproachSection from "@/components/ApproachSection";
import ProofSection from "@/components/ProofSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const ForBrands = () => {
  return (
    <div className="min-h-screen">
      <div className="pt-20">
        <ForBrandsSection />
        <ApproachSection />
        <ProofSection />
        <CTASection />
      </div>
      <Footer />
    </div>
  );
};

export default ForBrands;
