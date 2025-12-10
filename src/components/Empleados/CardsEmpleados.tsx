import { TbUsers, TbUserCheck, TbUserX } from "react-icons/tb";

type Props = {
  totalEmpleados: number;
  empleadosActivos: number;
  empleadosInactivos: number;
};

export default function CardsEmpleados({
  totalEmpleados,
  empleadosActivos,
  empleadosInactivos,
}: Props) {
  const cards = [
    {
      title: "Total Empleados",
      value: totalEmpleados,
      icon: TbUsers,
      color: "bg-blue-500",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Activos",
      value: empleadosActivos,
      icon: TbUserCheck,
      color: "bg-green-500",
      textColor: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Inactivos",
      value: empleadosInactivos,
      icon: TbUserX,
      color: "bg-red-500",
      textColor: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <div
            key={index}
            className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5 transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {card.title}
                </p>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                  {card.value.toLocaleString("es-DO")}
                </h3>
              </div>
              <div className={`p-3 rounded-xl ${card.bgColor}`}>
                <IconComponent className={`w-6 h-6 ${card.textColor}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
