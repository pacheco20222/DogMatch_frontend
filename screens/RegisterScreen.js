import React, { useState } from "react";
import { View, Text, Button, TextInput, StyleSheet } from 'react-native';

export default function RegisterScreen(){
    const  [email, setEmail] = useState("");
    const  [first_name, setFirstName] = useState("");
    const  [last_name, setLastName] = useState("");
    const  [username, setUsername] = useState("");
    const [phone_number, setPhoneNumber] = useState("");
    const [country, setCountry] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const  [password, setPassword] = useState("");

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Register</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />
            <TextInput
                style={styles.input}
                placeholder="First Name"
                value={first_name}
                onChangeText={setFirstName}
            />
            <TextInput
                style={styles.input}
                placeholder="Last Name"
                value={last_name}
                onChangeText={setLastName}
            />
            <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
            />
            <TextInput
                style={styles.input}
                placeholder="Phone Number"
                value={phone_number}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
            />
            <TextInput
                style={styles.input}
                placeholder="Country"
                value={country}
                onChangeText={setCountry}
            />
            <TextInput
                style={styles.input}
                placeholder="City"
                value={city}
                onChangeText={setCity}
            />
            <TextInput
                style={styles.input}
                placeholder="State"
                value={state}
                onChangeText={setState}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
            />
            <Button title="Register" onPress={() => { /* Handle registration logic */ }} />
            <Button
                title="Already have an account? Login"
                onPress={() => navigation.navigate('Login')}
            />
        </View>
    )
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