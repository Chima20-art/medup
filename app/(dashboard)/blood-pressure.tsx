import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import MetricInputTemplate from '@/components/metricInputLayout'

export default function BloodPressure() {
    const router = useRouter()
    const [date, setDate] = useState(new Date())
    const [systolic, setSystolic] = useState('')
    const [diastolic, setDiastolic] = useState('')
    const [isEnteringSystolic, setIsEnteringSystolic] = useState(true)

    const handleNumberPress = (num: string) => {
        if (isEnteringSystolic) {
            if (systolic.length < 3) {
                setSystolic(systolic + num)
                if (systolic.length === 2) {
                    setIsEnteringSystolic(false)
                }
            }
        } else {
            if (diastolic.length < 3) {
                setDiastolic(diastolic + num)
            }
        }
    }

    const handleDeletePress = () => {
        if (!isEnteringSystolic && diastolic === '') {
            setIsEnteringSystolic(true)
        } else if (isEnteringSystolic) {
            setSystolic(systolic.slice(0, -1))
        } else {
            setDiastolic(diastolic.slice(0, -1))
        }
    }

    const handleDone = () => {
        // Save the values to your database here
        router.back()
    }

    return (
        <MetricInputTemplate
            title="Blood pressure"
            value={systolic}
            secondaryValue={diastolic}
            date={date}
            onDateChange={(event: any, selectedDate: any) => {
                if (selectedDate) setDate(selectedDate)
            }}
            onNumberPress={handleNumberPress}
            onDeletePress={handleDeletePress}
            onDonePress={handleDone}
            unit="systolic"
            secondaryUnit="diastolic"
        />
    )
}

