import Container from "@components/ui/container";
import WidgetLink from "@components/widgets/widget-link";
import WidgetSocial from "@components/widgets/widget-social";
import WidgetContact from "@components/widgets/widget-contact";

interface WidgetsProps {
  widgets: {
    id: number | string;
    widgetTitle: string;
    lists: any;
  }[];
  // When true, both widgetTitle and list labels are plain admin-edited
  // strings — WidgetLink renders them as-is. When false / undefined,
  // they're i18n keys (legacy `data.tsx` fallback) that need t().
  liveTitles?: boolean;
}

const Widgets: React.FC<WidgetsProps> = ({ widgets, liveTitles }) => {
  return (
    <Container>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5 md:gap-9 lg:gap-x-8 xl:gap-5  pb-9 md:pb-14 lg:pb-16 2xl:pb-20 3xl:pb-24 lg:mb-0.5 2xl:mb-0 3xl:-mb-1">
        <WidgetSocial />
        <WidgetContact />
        {widgets.map((widget, index) => (
          <WidgetLink
            data={widget}
            liveLabels={liveTitles}
            key={`widget-link-${index}`}
          />
        ))}
      </div>
    </Container>
  );
};

export default Widgets;
