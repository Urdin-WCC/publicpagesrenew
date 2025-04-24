export default function FooterFormV2() {
  const role = useCurrentUserRole();
  const isMaster = checkUserRole(role, "MASTER");
  
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    setValue, 
    watch,
    control, 
    formState: { isSubmitting }
  } = useForm<FooterConfig>({
    defaultValues: { 
      widgets: [], 
      height: "", 
      secondaryHtml: "" 
    }
  });
  
  const { fields, append, remove } = useFieldArray({ control, name: "widgets" });

  useEffect(() => {
    const loadConfig = async () => {
      try {
        console.log("🔍 Cargando configuración de footer...");
        const footerConfig = await fetchFooterConfig();
        
        if (!footerConfig) {
          console.log("⚠️ No se pudo cargar la configuración");
          setIsInitialDataLoaded(true);
          return;
        }
        
        console.log("📦 Footer cargado:", footerConfig);
        
        if (Array.isArray(footerConfig.widgets)) {
          // Limpiar array existente primero si es necesario
          if (fields.length > 0) {
            for (let i = fields.length - 1; i >= 0; i--) {
              remove(i);
            }
          }
          
          // Añadir widgets individualmente
          footerConfig.widgets.forEach(widget => {
            append({
              type: widget.type || WIDGET_TYPES[0]?.value || 'latest_posts',
              config: widget.config || {}
            });
          });
        }
        
        setValue("height", footerConfig.height || "");
        setValue("secondaryHtml", footerConfig.secondaryHtml || "");
        
        setIsInitialDataLoaded(true);
      } catch (error) {
        console.error('❌ Error loading footer config:', error);
        toast.error('Error al cargar la configuración');
        setIsInitialDataLoaded(true);
      }
    };
    
    loadConfig();
  }, [setValue, fields.length, remove, append]);

  const onSubmit = async (data: FooterConfig) => {
    try {      
      console.log("📝 Guardando configuración:", data);
      
      const result = await saveFooterConfig(data);
      
      if (result.success) {
        toast.success("Configuración guardada correctamente");
      } else {
        toast.error(result.message || "Error al guardar");
      }
    } catch (error) {
      console.error('❌ Error saving footer config:', error);
      toast.error("Error al guardar la configuración");
    }
  };

  if (!isInitialDataLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        <span className="ml-2">Cargando configuración...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="height">Altura del pie de página (px, rem, etc.)</Label>
            <Input
              id="height"
              {...register("height")}
              placeholder="Ejemplo: 120px"
            />
          </div>

          <WidgetsSection 
            fields={fields} 
            append={append} 
            remove={remove} 
            control={control} 
          />
          
          {isMaster && (
            <div className="space-y-2">
              <Label htmlFor="secondaryHtml">HTML secundario (solo master)</Label>
              <HtmlEditor
                value={watch("secondaryHtml")}
                onChange={val => setValue("secondaryHtml", val)}
                label=""
              />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
