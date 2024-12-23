import React, {useState} from "react";
import {Switch, Text, View} from "react-native";
import PillIcon from "@/assets/images/pillIcon.svg";


interface MedicationCard {
    id: string
    name: string
    dosage: string
    startDate: string
    endDate: string
    remainingPills: number
    renewalDate: string
    instructions: string
    duration: string
    isActive: boolean
}


export default function  MedicationCard  ({ medication }: { medication: MedicationCard })  {
    const [isEnabled, setIsEnabled] = useState(medication.isActive)
    const toggleSwitch = () => setIsEnabled(previousState => !previousState)

    // @ts-ignore
    return (
        <View className="bg-primary-50 rounded-3xl p-6 mb-6 relative">
            <View className="flex-row items-center mb-4">
                <Text style={{ fontFamily: 'Poppins_800ExtraBold' }} className="text-xl text-starts">
                    {medication.name}
                </Text>
                <Switch
                    trackColor={{ false: 'primary', true: 'primary' }}
                    thumbColor={isEnabled ? 'primary' : '#primary'}
                    onValueChange={toggleSwitch}
                    value={isEnabled}
                    className="ml-4"
                />
            </View>

            <View className="mb-4 space-y-1">
                <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-gray-600">
                    • {medication.dosage}
                </Text>
                <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-gray-600">
                    • début: {medication.startDate}, fin: {medication.endDate} ({medication.remainingPills}/10)
                </Text>
                <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-gray-600">
                    • Il reste {medication.remainingPills} comprimés
                </Text>
                <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-gray-600">
                    • renouvelez votre prescription avant le {medication.renewalDate}
                </Text>
            </View>

            <View className="flex flex-row items-center justify-between">
                <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-gray-600">
                    {medication.instructions}
                </Text>

                {/* Duration pill */}
                <View className="bg-primary-300 rounded-full px-4 py-1.5">
                    <Text style={{ fontFamily: 'Poppins_500Medium' }} className="text-secondary text-sm">
                        {medication.duration}
                    </Text>
                </View>
            </View>

            {/* Position pill icon in top right, rotated horizontally */}
            <View className="absolute -top-10 right-4 transform scale-x-[-1]">
                <PillIcon size={8} />
            </View>
        </View>
    )
}
