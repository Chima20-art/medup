import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import MetricInputTemplate from '@/components/metricInputLayout'

export default function Weight() {
    const router = useRouter()
    const [date, setDate] = useState(new Date())
    const [value, setValue] = useState('')

    const handleNumberPress = (num: string) => {
        if (num === '.' && value.includes('.')) return
        if (value.includes('.') && value.split('.')[1].length >= 1) return
        setValue(value + num)
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
            title="Weight"
            value={value}
            date={date}
            onDateChange={(event:any, selectedDate: any) => {
                if (selectedDate) setDate(selectedDate)
            }}
            onNumberPress={handleNumberPress}
            onDeletePress={handleDeletePress}
            onDonePress={handleDone}
            unit="kg"
        />
    )
}

