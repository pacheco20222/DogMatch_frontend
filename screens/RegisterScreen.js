import React, { useState } from "react";
import { View, Text, Button, TextInput } from 'react-native';
import GlobalStyles from "../styles/GlobalStyles";
import { apiFetch } from "../api/client";

export default function RegisterScreen({ navigation }) {
    const [email, setEmail] = useState("");
    const [first_name, setFirstName] = useState("");
    const [last_name, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [phone_number, setPhoneNumber] = useState("");
    const [country, setCountry] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await apiFetch("/api/auth/register", {
                method: "POST",
                body: {
                    email,
                    password,
                    username,
                    first_name,
                    last_name,
                    phone: phone_number,
                    city,
                    state,
                    country,
                    user_type: 'owner'
                }
            });

            if (data.user) {
                alert("Registration successful! Please log in.");
                navigation.navigate('Login');
            } else {
                setError(
                    data.messages
                    ? Object.values(data.messages).flat().join('\n')
                    : data.message || 'Registration failed. Please try again.'
                );
            }
        } catch (error) {
            setError('An error occurred. Please try again.');
        }
        setLoading(false);
    };

    return (
        <View style={GlobalStyles.container}>
            <Text style={GlobalStyles.title}>Register</Text>
            {error ? <Text style={GlobalStyles.errorText}>{error}</Text> : null}
            <TextInput
                style={GlobalStyles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />
            <TextInput
                style={GlobalStyles.input}
                placeholder="First Name"
                value={first_name}
                onChangeText={setFirstName}
            />
            <TextInput
                style={GlobalStyles.input}
                placeholder="Last Name"
                value={last_name}
                onChangeText={setLastName}
            />
            <TextInput
                style={GlobalStyles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
            />
            <TextInput
                style={GlobalStyles.input}
                placeholder="Phone Number"
                value={phone_number}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
            />
            <TextInput
                style={GlobalStyles.input}
                placeholder="Country"
                value={country}
                onChangeText={setCountry}
            />
            <TextInput
                style={GlobalStyles.input}
                placeholder="City"
                value={city}
                onChangeText={setCity}
            />
            <TextInput
                style={GlobalStyles.input}
                placeholder="State"
                value={state}
                onChangeText={setState}
            />
            <TextInput
                style={GlobalStyles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
            />
            <Button title={loading ? "Registering user.." : "Register"} onPress={handleRegister} disabled={loading} />
            <Button
                title="Already have an account? Login"
                onPress={() => navigation.navigate('Login')}
            />
        </View>
    );
}

