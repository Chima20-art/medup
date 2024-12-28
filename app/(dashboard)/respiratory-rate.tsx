import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import MetricInputTemplate from '@/components/metricInputLayout'

export default function HeartRate() {
    const router = useRouter()
    const [date, setDate] = useState(new Date())
    const [value, setValue] = useState('')

    const handleNumberPress = (num: string) => {
        if (value.length < 3) {
            setValue(value + num)
        }
    }

    const handleDeletePress = () => {
        setValue(value.slice(0, -1))
    }

    const handleDone = () => {
        // Save the value to your database here
        router.back()
    }

    return (
        <MetricInputTemplate
            title="Heart rate"
            value={value}
            date={date}
            onDateChange={(event: any, selectedDate: any) => {
                if (selectedDate) setDate(selectedDate)
            }}
            onNumberPress={handleNumberPress}
            onDeletePress={handleDeletePress}
            onDonePress={handleDone}
            unit="bpm"
        />
    )
}

