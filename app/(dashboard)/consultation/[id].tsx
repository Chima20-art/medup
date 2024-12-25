import React, { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from "@/utils/supabase";
import ConsultationDetails from '@/components/ConsultationDetails';

export default function ConsultationPage() {
    const { id } = useLocalSearchParams();
    const [consultation, setConsultation] = useState(null);

    useEffect(() => {
        const fetchConsultation = async () => {
            const { data, error } = await supabase
                .from('consultations')
                .select('*, specialties(name, hexColor)')
                .eq('id', id)
                .single();

            if (error) {
                console.error("Error fetching consultation:", error);
            } else {
                setConsultation(data);
            }
        };

        fetchConsultation();
    }, [id]);

    if (!consultation) {
        return null; // Or a loading indicator
    }

    return <ConsultationDetails consultation={consultation} />;
}
