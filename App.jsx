import { ConvexProvider, ConvexReactClient } from "convex/react";
import { EXPO_PUBLIC_CONVEX_URL } from "@env";
import React, { StrictMode, useState } from "react";
import { FlatList, SafeAreaView, Text, TextInput, View } from "react-native";
import { useMutation, useQuery } from "convex/react";
import { api } from "./convex/_generated/api";
import styles from "./styles";

function InnerApp() {
  const messages = useQuery(api.messages.list) || [];

  const [newMessageText, setNewMessageText] = useState("");
  const sendMessage = useMutation(api.messages.send);

  const [name] = useState(() => "User " + Math.floor(Math.random() * 10000));
  async function handleSendMessage(event) {
    const text = newMessageText.trim();
    if (!text) return;
    event.preventDefault();
    setNewMessageText("");
    await sendMessage({ body: text, author: name });
  }

  return (
    <SafeAreaView style={styles.body}>
      <Text style={styles.title}>Convex Chat</Text>
      <View style={styles.name}>
        <Text style={styles.nameText} testID="NameField">
          {name}
        </Text>
      </View>
      <FlatList
        data={messages}
        testID="MessagesList"
        keyExtractor={(item) => item._id}
        renderItem={(x) => {
          const message = x.item;
          return (
            <View style={styles.messageContainer}>
              <Text>
                <Text style={styles.messageAuthor}>{message.author}:</Text>{" "}
                {message.body}
              </Text>
              <Text style={styles.timestamp}>
                {new Date(message._creationTime).toLocaleTimeString()}
              </Text>
            </View>
          );
        }}
      />
      <TextInput
        placeholder="Write a message…"
        style={styles.input}
        onSubmitEditing={handleSendMessage}
        onChangeText={(newText) => setNewMessageText(newText)}
        defaultValue={newMessageText}
        testID="MessageInput"
        value={newMessageText}
      />
    </SafeAreaView>
  );
}

const App = () => {
  const convex = new ConvexReactClient(EXPO_PUBLIC_CONVEX_URL, {
    // We need to disable this to be compatible with React Native
    unsavedChangesWarning: false,
  });
  return (
    <StrictMode>
      <ConvexProvider client={convex}>
        <InnerApp />
      </ConvexProvider>
    </StrictMode>
  );
};

export default App;
