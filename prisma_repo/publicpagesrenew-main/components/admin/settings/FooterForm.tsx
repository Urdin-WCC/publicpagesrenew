"use client";

import React, { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { WIDGET_TYPES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import HtmlEditor from "@/components/core/HtmlEditor";
import { useCurrentUserRole, checkUserRole } from "@/lib/auth";
import { FooterConfig, fetchFooterConfig, saveFooterConfig } from "@/actions/footer-actions";

export default function FooterForm() {
  const role = useCurrentUserRole();
  const isMaster = checkUserRole(role, "MASTER");
  
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    setValue, 
    watch,
    control, 
    formState: { errors, isSubmitting }
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
          console.log("⚠️ No se pudo cargar la configur
