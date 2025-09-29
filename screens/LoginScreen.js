import React, { useState } from "react";
import { View, Text, Button, TextInput, StyleSheet } from "react-native";
import { StackScreenLifecycleState } from "react-native-screens";

export default function LoginScreen( { navigation } ) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (
    <View style={styles.container}>
        <Text style={styles.title}>Login</Text>
        <TextInput
            style={styles.input}
            placeholder="Username"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
        />
        <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
        />
        <Button title="Login" onPress={() => { /* Handle login logic */ }} />
        <Button
            title="Don't have an account? Register"
            onPress={() => navigation.navigate('Register')}
        />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f7f7f7',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
});