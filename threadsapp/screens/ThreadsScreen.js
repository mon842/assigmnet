import {
    StyleSheet,
    Text,
    View,
    Image,
    SafeAreaView,
    TextInput,
    Button,
} from "react-native";
import React, { useState, useEffect, useContext } from "react";
import { UserType } from "../UserContext";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwt_decode from "jwt-decode";

const ThreadsScreen = () => {
    const { userId, setUserId } = useContext(UserType);
    const [currUser ,setcurrUser]=useState("");
    const [content, setContent] = useState("");
    const handlePostSubmit = () => {
        const postData = {
            userId,
        };

        if (content) {
            postData.content = content;
        }

        axios
            .post("http://localhost:3000/create-post", postData)
            .then((response) => {
                setContent("");
            })
            .catch((error) => {
                console.log("error creating post", error);
            });
    };

    useEffect(() => {
        const fetchUser = async () => {
            const token = await AsyncStorage.getItem("authToken");
            const decodedToken = jwt_decode(token);
            const userId = decodedToken.userId;
            setUserId(userId);
            console.log(userId);

            axios
            .get(`http://localhost:3000/curr/${userId}`)
            .then((response) => {
                setcurrUser(response.data);
            })
            .catch((error) => {
                console.log("error", error);
            });
        };
        
        fetchUser();
    }, []);
    // console.log(currUser);
    return (
        <SafeAreaView style={{ padding: 10 }}>
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    padding: 10,
                }}
            >
                <Image
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        resizeMode: "contain",
                    }}
                    source={{
                        uri: "https://cdn-icons-png.flaticon.com/128/149/149071.png",
                    }}
                />

                <Text>{currUser.name}</Text>
            </View>

            <View style={{ flexDirection: "row", marginLeft: 10 }}>
                <TextInput
                    value={content}
                    onChangeText={(text) => setContent(text)}
                    placeholderTextColor={"black"}
                    placeholder="Type your message..."
                    multiline
                />
            </View>

            <View style={{ marginTop: 20 }} />

            <Button onPress={handlePostSubmit} title="Share Post" />
        </SafeAreaView>
    );
};

export default ThreadsScreen;

const styles = StyleSheet.create({});