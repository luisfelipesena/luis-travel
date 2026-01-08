import { Redirect } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, View } from "react-native"
import { isAuthenticated } from "../src/lib/auth"

export default function Index() {
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    isAuthenticated().then((auth) => {
      setAuthenticated(auth)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    )
  }

  if (authenticated) {
    return <Redirect href="/(app)" />
  }

  return <Redirect href="/(auth)/login" />
}
