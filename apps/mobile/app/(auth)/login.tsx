import { View, Text, Pressable, Image } from "react-native"
import { router } from "expo-router"
import { useState } from "react"
import { signInWithGoogle, signInWithGitHub } from "../../src/lib/auth"

export default function LoginScreen() {
  const [loading, setLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setLoading(true)
    const success = await signInWithGoogle()
    if (success) {
      router.replace("/(app)")
    }
    setLoading(false)
  }

  const handleGitHubSignIn = async () => {
    setLoading(true)
    const success = await signInWithGitHub()
    if (success) {
      router.replace("/(app)")
    }
    setLoading(false)
  }

  return (
    <View className="flex-1 bg-white justify-center items-center px-6">
      <View className="items-center mb-12">
        <Text className="text-4xl font-bold text-primary mb-2">Luis Travel</Text>
        <Text className="text-lg text-muted-foreground text-center">
          Planeje suas viagens de forma inteligente
        </Text>
      </View>

      <View className="w-full gap-4">
        <Pressable
          onPress={handleGoogleSignIn}
          disabled={loading}
          className="bg-white border border-border rounded-xl p-4 flex-row items-center justify-center gap-3"
        >
          <Text className="text-base font-medium text-foreground">
            Continuar com Google
          </Text>
        </Pressable>

        <Pressable
          onPress={handleGitHubSignIn}
          disabled={loading}
          className="bg-foreground rounded-xl p-4 flex-row items-center justify-center gap-3"
        >
          <Text className="text-base font-medium text-white">
            Continuar com GitHub
          </Text>
        </Pressable>
      </View>

      <Text className="text-sm text-muted-foreground mt-8 text-center">
        Ao continuar, você concorda com nossos{"\n"}Termos de Serviço e Política de Privacidade
      </Text>
    </View>
  )
}
