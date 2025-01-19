import React, { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from "@/utils/supabase";
import MedicamentDetail from '@/components/MedicamentDetail';

export default function MedicamentPage() {
    const { id } = useLocalSearchParams();
    const [medicament, setMedicament] = useState(null);

    useEffect(() => {
        const fetchMedicament = async () => {
            const { data, error } = await supabase
                .from("medicaments")
                .select("*")
                .eq("id", id)
                .single();

            if (error) {
                console.error("Error fetching medicament:", error);
            } else {
                setMedicament(data);
            }
        };

        fetchMedicament();
    }, [id]);

    if (!medicament) {
        return null; // Or a loading indicator
    }

    return <MedicamentDetail initialData={medicament} />;
}

