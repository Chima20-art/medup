import React, { useState } from 'react'
import { Modal, View, Animated } from 'react-native'
import { useTheme } from '@react-navigation/native'

import GenderStep from "@/components/GenderStep";

interface OnboardingModalProps {
    visible: boolean
    onClose: () => void
    onComplete: () => void
}

export default function OnboardingModal({
                                            visible,
                                            onClose,
                                            onComplete
                                        }: OnboardingModalProps) {
    const { colors } = useTheme()
    const [currentStep, setCurrentStep] = useState(1)
    const [userData, setUserData] = useState({
        gender: null,
        bloodType: null,
        medicalHistory: [],
        height: '',
        weight: ''
    })

    const handleNext = () => {
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1)
        } else {
            onComplete()
        }
    }

    const handleSkip = () => {
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1)
        } else {
            onComplete()
        }
    }

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <GenderStep
                        selectedGender={userData.gender}
                        onGenderChange={(gender:any) => setUserData({ ...userData, gender })}
                        onClose={onClose}
                        onSkip={handleSkip}
                        onNext={handleNext}
                    />
                )
            // case 2:
            //     return (
            //         <BloodTypeStep
            //             selectedBloodType={userData.bloodType}
            //             onBloodTypeChange={(bloodType:any) => setUserData({ ...userData, bloodType })}
            //             onClose={onClose}
            //             onSkip={handleSkip}
            //             onNext={handleNext}
            //         />
            //     )
            // case 3:
            //     return (
            //         <MedicalHistoryStep
            //             selectedConditions={userData.medicalHistory}
            //             onConditionsChange={(medicalHistory: any) => setUserData({ ...userData, medicalHistory })}
            //             onClose={onClose}
            //             onSkip={handleSkip}
            //             onNext={handleNext}
            //         />
            //     )
            // case 4:
            //     return (
            //         <BodyMeasurementsStep
            //             height={userData.height}
            //             weight={userData.weight}
            //             onHeightChange={(height: any) => setUserData({ ...userData, height })}
            //             onWeightChange={(weight:any) => setUserData({ ...userData, weight })}
            //             onClose={onClose}
            //             onSkip={handleSkip}
            //             onNext={handleNext}
            //         />
            //     )
            default:
                return null
        }
    }

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View
                className="flex-1 h-[70%] bg-amber-200"
                style={{ backgroundColor: colors.background }}
            >
                {renderStep()}
            </View>
        </Modal>
    )
}