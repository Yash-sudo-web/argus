import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';
import logo from '../../assets/images/argusLogo.png';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import ChatBot from '../chatbot/chatbot';
import { Ionicons } from '@expo/vector-icons';

const profilePictureUri = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wyNjYzN3wwfDF8c2VhcmNofDJ8fHByb2ZpbGV8ZW58MHx8fHwxNjk3NjIxOTkyfDA&ixlib=rb-4.0.3&q=80&w=400';

const Health = () => {

  const navigation = useNavigation();

  const [chatVisible, setChatVisible] = useState(false);
  const toggleChat = () => {
    setChatVisible(!chatVisible);
  };

  const [user, setUser] = useState({
    username: '',
    email: '',
  });

  const [contactData, setContactData] = useState({
    name: '',
    relation: '',
    phone: '',
    email: '',
  });

  const [isEditing, setIsEditing] = useState(false);

  const [workingConditions, setWorkingConditions] = useState({
    temperature: 0,
    humidity: 0,
    noise: 0,
    light: 0,
    airQuality: 0,
    amenities: '',
    breaks: '',
    otherConditions: '',
  });

  const getJWT = async () => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      return token;
    } catch (error) {
      console.error('Error retrieving JWT', error);
    }
  };

  const getUser = async () => {
    try {
      const token = await getJWT();
      const response = await axios.get("http://localhost:8080/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(response.data);
    }
    catch (error) {
      console.log("Failed to retrieve user:", error);
    }
  };

  const updateEmergencyContact = async () => {
    try {
      const token = await getJWT();
      const response = await axios.post('http://localhost:8080/emergency/contact', {
        userId: user._id,
        name: contactData.name,
        relation: contactData.relation,
        phone: contactData.phone,
        email: contactData.email,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update emergency contact:', error);
    }
  };

  const getEmergencyContact = async () => {
    try {
      const token = await getJWT();
      const response = await axios.get(`http://localhost:8080/emergency/contacts/${user._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setContactData(response.data[0]);
  } catch (error) {
    console.error('Failed to retrieve emergency contact:', error);
  }
};

  const getWorkingConditions = async () => {
    try {
      const token = await getJWT();
      const response = await axios.get('http://localhost:8080/workingConditions', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data[0]);
    } catch (error) {
      console.error('Failed to retrieve working conditions:', error);
    }
  }

  useEffect(() => {
    getWorkingConditions();
  }, []);


  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    if (user._id) {
      getEmergencyContact();
    }
  }, [user]);

  const handleEditButtonClick = () => {
    if (isEditing) {
      updateEmergencyContact();
    } else {
      setIsEditing(true);
    }
  };

  const [firstAidStock, setFirstAidStock] = useState([
    { name: 'Bandages', quantity: 50 },
    { name: 'Plasters', quantity: 20 },
    { name: 'Scissors', quantity: 5 },
    { name: 'Tweezers', quantity: 5 },
    { name: 'Gloves', quantity: 20 },
    { name: 'Antiseptic', quantity: 10 },
    { name: 'Cotton Wool', quantity: 10 },
    { name: 'Thermometer', quantity: 5 },
    { name: 'Painkillers', quantity: 10 },
    { name: 'Burn Cream', quantity: 10 },
  ]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={logo} style={styles.logo} />
        <Image source={{ uri: profilePictureUri }} style={styles.profilePicture} />
      </View>

      <Text style={styles.sectionTitle}>Health Section</Text>

      <View style={styles.firstAidSection}>
        <Text style={styles.subTitle}>First Aid Stock</Text>
        <View style={styles.taskList}>
          {firstAidStock.map((item, index) => (
            <View key={index} style={styles.taskItem}>
              <Text style={styles.taskText}>{item.name}: {item.quantity}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.emergencyContacts}>
        <Text style={styles.subTitle}>Emergency Contacts (workers)</Text>
        <TextInput
          style={styles.input}
          placeholder="User Id"
          keyboardType="numeric"
          value="EMP13422"
          editable={false}
        />
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={contactData.name}
          onChangeText={(text) => setContactData({ ...contactData, name: text })}
          editable={isEditing}
        />
        <TextInput
          style={styles.input}
          placeholder="Relation"
          value={contactData.relation}
          onChangeText={(text) => setContactData({ ...contactData, relation: text })}
          editable={isEditing}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone"
          keyboardType="phone-pad"
          value={contactData.phone}
          onChangeText={(text) => setContactData({ ...contactData, phone: text })}
          editable={isEditing}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          value={contactData.email}
          onChangeText={(text) => setContactData({ ...contactData, email: text })}
          editable={isEditing}
        />
        <TouchableOpacity onPress={handleEditButtonClick}>
          <Text style={styles.button}>{isEditing ? 'Done' : 'Update Contact'}</Text>
        </TouchableOpacity>
      </View>
      <View style = {styles.bottomDivStyle}>
        <TouchableOpacity
          style={styles.changeButton}
          onPress={() => navigation.navigate('SafetyIncidentsScreen')} 
        >
          <Text style={styles.applyButtonText}>Safety Incidents</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.changeButton}
          onPress={() => navigation.navigate('SafetyAuditsScreen')} 
        >
          <Text style={styles.applyButtonText}>Safety Audits</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.fab} onPress={toggleChat}>
        <Ionicons name="chatbubble-ellipses-outline" size={24} color="white" />
      </TouchableOpacity>

      {chatVisible && (<ChatBot visible={chatVisible} toggleChat={toggleChat} />)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 50,
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 20,
    textAlign: 'center',
  },
  firstAidSection: {
    marginBottom: 20,
  },
  subTitle: {
    color: '#EF2A39',
    fontSize: 20,
    marginBottom: 10,
  },
  taskList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 10,
  },
  taskText: {
    color: '#FFFFFF',
  },
  emergencyContacts: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#3A3A3A',
    color: '#FFFFFF',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  button: {
    color: '#FFFFFF',
    textAlign: 'center',
    backgroundColor: '#EF2A39',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  changeButton: {
    color: '#FFFFFF',
    textAlign: 'center',
    backgroundColor: '#EF2A39',
    padding: 10,
    borderRadius: 10,
    marginTop: 5,
    width: '47.5%',
  },
  bottomDivStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  applyButtonText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#fff',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 15,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ff5c5c',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
});

export default Health;
