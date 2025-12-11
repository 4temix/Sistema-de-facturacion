import { FormikProps } from "formik";
import { NominaFormValues } from "../../Types/Nomina.types";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import Select from "react-select";
import { customStyles } from "../../Utilities/StyleForReactSelect";

interface FormNominaProps {
  formik: FormikProps<NominaFormValues>;
  onCancel: () => void;
  onSubmit: () => void;
}

type Option = {
  value: string;
  label: string;
};

const tiposNomina: Option[] = [
  { value: "Quincenal", label: "Quincenal" },
  { value: "Mensual", label: "Mensual" },
  { value: "Semanal", label: "Semanal" },
];

export default function FormNomina({
  formik,
  onCancel,
  onSubmit,
}: FormNominaProps) {
  const { values, errors, touched, setFieldValue, setFieldTouched } = formik;

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Crear Nueva Nómina</h2>
        <p className="text-sm text-gray-500 mt-1">
          Complete los datos para generar una nueva nómina
        </p>
      </div>

      <form className="space-y-5">
        {/* Tipo de Nómina */}
        <div>
          <Label htmlFor="tipo">Tipo de Nómina</Label>
          <Select<Option, false>
            id="tipo"
            name="tipo"
            styles={customStyles(!!errors.tipo && touched.tipo)}
            placeholder="Seleccione el tipo..."
            menuPortalTarget={document.body}
            value={tiposNomina.find((t) => t.value === values.tipo) || null}
            options={tiposNomina}
            onChange={(e) => {
              if (!e) return;
              setFieldValue("tipo", e.value);
            }}
            onBlur={() => setFieldTouched("tipo", true)}
          />
          {errors.tipo && touched.tipo && (
            <p className="mt-1.5 text-xs text-error-500">{errors.tipo}</p>
          )}
        </div>

        {/* Período */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="periodoInicio">Fecha Inicio</Label>
            <Input
              type="date"
              id="periodoInicio"
              value={values.periodoInicio}
              onChange={(e) => setFieldValue("periodoInicio", e.target.value)}
              onBlur={() => setFieldTouched("periodoInicio", true)}
              error={!!errors.periodoInicio && touched.periodoInicio}
            />
            {errors.periodoInicio && touched.periodoInicio && (
              <p className="mt-1.5 text-xs text-error-500">
                {errors.periodoInicio}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="periodoFin">Fecha Fin</Label>
            <Input
              type="date"
              id="periodoFin"
              value={values.periodoFin}
              onChange={(e) => setFieldValue("periodoFin", e.target.value)}
              onBlur={() => setFieldTouched("periodoFin", true)}
              error={!!errors.periodoFin && touched.periodoFin}
            />
            {errors.periodoFin && touched.periodoFin && (
              <p className="mt-1.5 text-xs text-error-500">
                {errors.periodoFin}
              </p>
            )}
          </div>
        </div>

        {/* Botones */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="button" onClick={onSubmit}>
            Generar Nómina
          </Button>
        </div>
      </form>
    </div>
  );
}

