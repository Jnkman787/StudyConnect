import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Platform } from 'react-native';
import { width } from '../utils/Scaling';
import Colors from '../utils/Colors';

// default value for arguments is undefined
const StringInput = ({ string, label, setText, setEndText, scrollDown, style, paragraph, length, hideText, inputLayout, capitalize }) => {
    const [activeInput, setActiveInput] = useState(false);

    return (
        <View style={[styles.inputLayout, style]}>
            <TextInput
                onFocus={() => setActiveInput(true)}
                onBlur={() => {
                    setActiveInput(false);
                    //if (label === 'Notes') {  <-- keep if I decide to include notes for tasks
                    //    scrollDown();
                    //}
                }}
                placeholder={activeInput ? '' : label}
                placeholderTextColor={'black'}
                value={string}
                onChangeText={setText}
                onEndEditing={setEndText}   // <-- unsure if needed
                multiline={paragraph}
                maxLength={length}
                //selectionColor={Platform.OS === 'ios' ? '#0066ff' : '#99ccff'}
                selectionColor={Colors.subTheme}
                secureTextEntry={hideText}
                keyboardType={inputLayout}
                autoCorrect={false}
                spellCheck={false}
                autoCapitalize={capitalize}
                style={[styles.inputContainer, {
                    borderColor: activeInput ? Colors.subTheme : 'black',
                    borderWidth: activeInput ? 2 : 1,
                    height: width > 550 ? 65 : 55
                    //height: width > 550 ? label === 'Notes' ? 90 : 65    // <-- keep if I decide to include notes for tasks
                    //    : label === 'Notes' ? 80 : 55
                }]}
            />
            <Text style={[styles.label, { color: 'black', opacity: string ? 1 : 0 }]}>{'  ' + label + '  '}</Text>
            <Text style={[styles.label, { color: Colors.subTheme, opacity: activeInput ? 1 : 0 }]}>{'  ' + label + '  '}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    inputLayout: {
        marginTop: 16
    },
    inputContainer: {
        alignSelf: 'center',
        width: width > 550 ? '70%' : '80%',
        paddingHorizontal: width > 550 ? 25 : 20,
        borderRadius: width > 550 ? 30 : 25,
        color: 'black',
        fontSize: width > 550 ? 20 : 17
    },
    label: {
        position: 'absolute',
        left: width > 550 ? '20.5%' : '18%',
        top: width > 550 ? -13 : -10,
        backgroundColor: Colors.theme,
        fontSize: width > 550 ? 17 : 14
    }
});

export default StringInput;