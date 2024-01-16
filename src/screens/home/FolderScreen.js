import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { width, verticalScale } from '../../utils/Scaling';
import Colors from '../../utils/Colors';
import Modal from 'react-native-modal';

import { AntDesign } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';

const getFileIcon = (fileType) => {
    let icon;

    if (fileType === 'text') {
        icon = <AntDesign name='filetext1' size={width > 550 ? 40 : 35} color={Colors.subTheme}/>
    } else if (fileType === 'jpg') {
        icon = <AntDesign name='jpgfile1' size={width > 550 ? 40 : 35} color={Colors.subTheme}/>
    } else if (fileType === 'pdf') {
        icon = <AntDesign name='pdffile1' size={width > 550 ? 40 : 35} color={Colors.subTheme}/>
    } else if (fileType === 'pptx') {
        icon = <AntDesign name='pptfile1' size={width > 550 ? 40 : 35} color={Colors.subTheme}/>
    } else if (fileType === 'docx') {
        icon = <AntDesign name='wordfile1' size={width > 550 ? 40 : 35} color={Colors.subTheme}/>
    }

    return icon;
};

const FolderScreen = ({ navigation, route }) => {
    const { groupName } = route.params;
    const [modalVisible, setModalVisible] = useState(false);

    // list of file names:
    // Final Report Template.docx
    // Design-Presentation-Evaluation.pdf
    // Final-Presentation-Demo-Guidelines.pdf
    // Design Review 2.pptx
    // Design Review 1.pptx
    // Deliverable Guidelines.pdf
    // ECE 4415-4416-2022-2023.pdf

    const FileDesign = (fileName, fileType, last) => {
        return (
            <View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {getFileIcon(fileType)}
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: width > 550 ? 18 : 16, marginLeft: 20 }}>{fileName}</Text>
                    </View>
                    <TouchableOpacity
                        //style={{ }}
                        onPress={() => setModalVisible(true)}
                    >
                        <Feather name='more-vertical' size={width > 550 ? 40 : 30} color='black'/>
                    </TouchableOpacity>
                </View>
                {!last && <View style={styles.fileBorder}/>}
            </View>
        );
    };

    return (
        <View style={styles.screen}>
            <View style={{ width: '90%', alignSelf: 'center' }}>
                <Text style={styles.headerText}>Latest Files</Text>
                {FileDesign('Final Report Template.docx', 'docx')}
                {FileDesign('Design-Presentation-Evaluation.pdf', 'pdf')}
                {FileDesign('Final-Presentation-Demo-Guidelines.pdf', 'pdf')}
                {FileDesign('Design Review 2.pptx', 'pptx')}
                {FileDesign('Design Review 1.pptx', 'pptx')}
                {FileDesign('Deliverable Guidelines.pdf', 'pdf')}
                {FileDesign('ECE 4415-4416-2022-2023.pdf', 'pdf', true)}
            </View>

            <Modal
                isVisible={modalVisible}
                onBackButtonPress={() => setModalVisible(false)}
                onBackdropPress={() => setModalVisible(false)}
                onSwipeComplete={() => setModalVisible(false)}
                swipeDirection='down'
                animationOutTiming={300}
                backdropTransitionOutTiming={500}
                backdropOpacity={0.55}
                style={{ justifyContent: 'flex-end', margin: 0 }}
            >
                <View style={styles.modalContainer}>
                    <View style={{ height: 5, width: 45, backgroundColor: 'black', marginTop: 12, alignSelf: 'center', borderRadius: 10 }}/>
                    
                    <TouchableOpacity
                        style={{ flexDirection: 'row', alignItems: 'center', marginLeft: width > 550 ? 25 : 20, marginTop: 25 }}
                        onPress={() => setModalVisible(false)}
                    >
                        <MaterialIcons name='file-download' size={width > 550 ? 45 : 40} color={Colors.subTheme}/>
                        <Text style={{ fontSize: width > 550 ? 20 : 18, fontFamily: 'roboto-medium', marginLeft: 20 }}>Save to phone</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={{ flexDirection: 'row', alignItems: 'center', marginLeft: width > 550 ? 32 : 27, marginTop: 25 }}
                        onPress={() => setModalVisible(false)}
                    >
                        <FontAwesome name='share' size={width > 550 ? 30 : 27} color={Colors.subTheme}/>
                        <Text style={{ fontSize: width > 550 ? 20 : 18, fontFamily: 'roboto-medium', marginLeft: width > 550 ? 28 : 26 }}>Share external</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={{ flexDirection: 'row', alignItems: 'center', marginLeft: width > 550 ? 25 : 21, marginTop: 25 }}
                        onPress={() => setModalVisible(false)}
                    >
                        <MaterialIcons name='report' size={width > 550 ? 43 : 38} color={Colors.subTheme}/>
                        <Text style={{ fontSize: width > 550 ? 20 : 18, fontFamily: 'roboto-medium', marginLeft: width > 550 ? 22 : 21 }}>Report</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Colors.theme
    },
    headerText: {
        fontSize: width > 550 ? 21 : 18,
        fontFamily: 'roboto-medium',
        marginTop: 20,
        marginBottom: width > 550 ? 30 : 25
    },
    fileBorder: {
        borderColor: Colors.border,
        borderBottomWidth: 1,
        marginVertical: width > 550 ? 20 : 15
    },
    modalContainer: {
        backgroundColor: Colors.theme,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: Platform.OS === 'ios' 
            ? width > 550 ? verticalScale(40) : 50
            : width > 550 ? verticalScale(30) : 35
    }
});

export default FolderScreen;