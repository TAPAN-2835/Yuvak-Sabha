import { SpiritualPortrait } from "./SpiritualPortrait";

export function SpiritualFooter() {
  return (
    <footer className="mt-10 border-t border-border bg-cream-gradient px-4 py-8">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6">
        <div className="grid grid-cols-3 gap-4 sm:gap-8">
          <SpiritualPortrait
            label="ભગવાન સ્વામિનારાયણ"
            subtitle="& ગુણાતીતાનંદ સ્વામી"
            src="/main.jpg"
          />
          <SpiritualPortrait label="પ્રમુખ સ્વામી મહારાજ" src="/psm.jpg" />
          <SpiritualPortrait label="મહંત સ્વામી મહારાજ" src="/msm.jpg" />
        </div>
        <div className="text-center">
          <p className="font-gujarati text-lg font-semibold text-maroon">જય સ્વામિનારાયણ</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Built with Seva for BAPS Yuvak Mandal
          </p>
        </div>
      </div>
    </footer>
  );
}
