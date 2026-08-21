import { Reveal } from "../common/animation";
import { Container } from "../ui/Container";
import { ImageActivitySection } from "./ImageActivitySection";
import { StatsMichelin } from "./StatsMichelin";


export function BrandProofSection() {
  return (
    <section className="min-h-svh snap-start bg-green-100 py-16 text-brand-ink">
      <Container >
        <Reveal type="zoom-in">
          <ImageActivitySection />
        </Reveal>
        <StatsMichelin />
      </Container>
    </section>
  )
}