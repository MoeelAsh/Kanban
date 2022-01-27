import React, { useState, useEffect } from 'react';

import {
  View,
  SafeAreaView,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  Image,
  Dimensions,
  Modal,
  Alert,
  TouchableOpacity,

} from 'react-native';


import SweetAlert from 'react-native-sweet-alert';
import { TextInput, } from 'react-native-gesture-handler';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import COLORS from '../consts/colors';
import plants from '../consts/plants';
const width = Dimensions.get('window').width / 2 - 30;

const RNFS = require("react-native-fs");


const HomeScreen = ({ navigation }) => {
  const [imageUri, setimageUri] = useState("");
  const [catergoryIndex, setCategoryIndex] = useState(0);
  const [searchText, setsearchText] = useState("");
  const [result, setResult] = useState(1);
  const [result1, setResult1] = useState(0);




  const [dataPlants, setDataPlants] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);


  const categories = ['ALL FLOWERS', 'FAVORITES', <Icon name='location-pin' size={24} />];


  const [toggle, settoggle] = useState(0);

  useEffect(() => {
    if (imageUri)
      setModalVisible(true);
    console.log("setting up and opening modal")
  }, [imageUri])

  useEffect(() => {
    console.log("pressed")
  }, [toggle])

  useEffect(() => {
    console.log(searchText)
  }, [searchText])

  useEffect(() => {
    const getFlowers = async () => {
      await fetch("http://10.0.2.2:3000/all_flowers")
        .then(res => res.json())
        .then(res => setDataPlants(res["flowers"]))
        .catch(error => console.log(error))
    }
    getFlowers();

    return () => setDataPlants([])
  }, [])

  const CategoryList = () => {
    return (
      <View style={style.categoryContainer}>
        {categories.map((item, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.8}
            onPress={() => setCategoryIndex(index)}>
            <Text
              style={[
                style.categoryText,
                catergoryIndex === index && style.categoryTextSelected,
              ]}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };



  const Card = ({ plant }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate('Details', plant)}
      >
        <View style={style.card}>
          <View style={{ alignItems: 'flex-end' }}>
            <View
              style={{
                width: 30,
                height: 30,
                borderRadius: 20,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: plant.like
                  ? 'rgba(245, 42, 42,0.2)'
                  : 'rgba(0,0,0,0.2) ',
              }}>
              <TouchableOpacity
                onPress={() => { plant.like = !plant.like; settoggle(!toggle) }}
              >
                <Icon
                  name="favorite"
                  size={18}
                  // onPress={() => { plant.like = !plant.like; setFavIconColor(!favIconColor) }}
                  color={plant.like ? COLORS.red : COLORS.black}
                />
              </TouchableOpacity>

            </View>
          </View>

          <View
            style={{
              height: 100,
              alignItems: 'center',
            }}
          >
            <Image
              source={require('../assets/plant1.png')}
              style={{ flex: 1, resizeMode: 'contain' }}
            />
          </View>

          <Text style={{ fontWeight: 'bold', fontSize: 17, marginTop: 10 }}>
            {plant.flower_name}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 5,
            }}>
            <Text style={{ fontSize: 19, fontWeight: 'bold' }}>
              {plant.botanical_name}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const openCamara = () => {
    const options = {
      storageOptions: {
        path: 'images',
        mediaType: 'photo',
      },
      includeBase64: true,
    };

    launchCamera(options, response => {
      console.log(response);
      // console.log('Response = ', response.assets[0].base64);
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        // You can also display the image using data:
        // const source = {uri: 'data:image/jpeg;base64,' + response.base64};
        // source={uri:source};
        const con = response.assets[0].base64
        // const { uri } = response;
        const source = { uri: "data:image/jpeg;base64," + con }
        setimageUri(source);
      }
    });
  };

  const openGallery = () => {
    let options = {
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };

    launchImageLibrary(options, response => {
      console.log('Response = ', response);
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
        alert(response.customButton);
      } else {
        const con = response.assets[0].base64
        // const { uri } = response;
        const source = { uri: "data:image/jpeg;base64," + con }
        setimageUri(source)
      }
    });
  };

  const sendReq = () => {
    setResult(0)
    fetch("/your_route", {
      method: "POST",
      body: {
        data: JSON.stringify(imageUri.uri)
      }
    })
      .then((res) =>
        res.json()
      )
      .then((res) => {
        if (res.status) {
          setResult1(1)
        }
        else {
          console.log("err");
        }
      })
      .catch((err)=>{
        setModalVisible(0);
        SweetAlert.showAlertWithOptions({
          title: "Can't connect to server!",
          subTitle: 'Something went wrong',
          confirmButtonTitle: 'OK',
          confirmButtonColor: '#000',
          otherButtonTitle: 'Cancel',
          otherButtonColor: '#dedede',
          style: 'danger',
          cancellable: true
        },
          callback => console.log('callback'));
      })
      
  }

  const modl = () => {
    return (
      <View style={{ width: '100%', height: '100%', alignItems: "center", justifyContent: 'center' }}>

        <View style={{ height: '50%', marginTop: "20%", borderWidth: 1, borderColor: 'gray', borderRadius: 30, alignItems: 'center', justifyContent: 'space-around', backgroundColor: 'white', width: '90%' }}>
          {result1 ?
            <>
              <Text>hola</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'space-evenly', }}>
                <Icon style={{ height: 28 }} name='dangerous' size={28} onPress={() => { setModalVisible(!modalVisible); setResult(1) }} />

                <TouchableOpacity onPress={() => setResult(1)}>
                  <View style={{ backgroundColor: 'green', margin: 0, justifyContent: 'center', alignItems: 'center', width: width, height: 40 }}>
                    <Text style={{ color: 'white' }}>
                      Open
                    </Text>
                  </View>
                </TouchableOpacity>
                <Icon style={{ height: 28 }} name='replay' size={28} onPress={() => { openCamara(); setResult(1) }} />
              </View>
            </>
            :
            <>
              <View style={{ height: "80%", width: '90%', justifyContent: 'flex-end' }}>
                <Image
                  source={imageUri ? imageUri : 0}
                  style={{
                    height: "95%",
                    width: "100%",

                  }} />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'space-evenly', }}>
                <Icon style={{ height: 28 }} name='dangerous' size={28} onPress={() => { setModalVisible(!modalVisible); setResult(1) }} />

                {
                  result ?
                    <TouchableOpacity onPress={() => sendReq()}>
                      <View style={{ backgroundColor: 'green', margin: 0, justifyContent: 'center', alignItems: 'center', width: width, height: 40 }}>
                        <Text style={{ color: 'white' }}>
                          Confirm
                        </Text>
                      </View>
                    </TouchableOpacity>
                    :
                    <Image
                      source={require("../assets/load.gif")}
                      style={{
                        width: width,
                        height: 40
                      }}
                    >

                    </Image>

                }
                <Icon style={{ height: 28 }} name='replay' size={28} onPress={() => { openCamara(); setResult(1) }} />
              </View>
            </>
          }
        </View>
      </View>

    )
  }


  return (
    <SafeAreaView
      style={{ flex: 1, paddingHorizontal: 20, backgroundColor: COLORS.white, paddingTop: 0 }}>
      <View style={style.header}>
        <View>
          <Text style={{ fontSize: 25, fontWeight: 'bold' }}>FYP Project</Text>
          <Text style={{ fontSize: 38, color: COLORS.green, fontWeight: 'bold' }}>
            Hello Plant!
          </Text>
        </View>
        <Icon style={{ height: 28 }} name='info' size={28} onPress={() => navigation.navigate("Info")} />
        <Icon style={{ height: 28 }} name='photo' size={28} onPress={() => openGallery()} />
        <Icon style={{ height: 28 }} name='camera-alt' size={28} onPress={() => { openCamara() }} />
      </View>

      <Modal
        animationType="slide"
        visible={modalVisible}
        transparent={true}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
        onDismiss={() => {
          console.log('dismiss');
          setModalVisible(false);
        }}
      >

        {

          modl()

        }


      </Modal>




      {/* <Image 
        source={imageUri}

        style = {{
        borderColor: 'black',
        height:30,
        width:30,
        borderWidth:2,
        }}/> */}

      <View style={{ marginTop: 30, flexDirection: 'row' }}>
        <View style={style.searchContainer}>
          <Icon name="search" size={25} style={{ marginLeft: 20 }} />
          <TextInput placeholder="Search" value={searchText} onChangeText={(e) => { setsearchText(e) }} style={style.input} />
        </View>
        {/* <View style={style.sortBtn}> */}
        {/* <Icon name="sort" size={30} color={COLORS.white} /> */}
        {/* </View> */}
      </View>
      <CategoryList />
      {
        catergoryIndex && dataPlants.length > 0 ? (
          <FlatList
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              marginTop: 10,
              paddingBottom: 50,
            }}
            numColumns={2}
            data={dataPlants}
            // data={dataPlants.filter(plantItem => plantItem.like).filter(plant=>plant.name.toLowerCase().includes(searchText.toLowerCase()))}
            renderItem={({ item }) => {
              return <Card plant={item} />;
            }}
          />
        ) : (
          <FlatList
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              marginTop: 10,
              paddingBottom: 50,
            }}
            numColumns={2}
            // data={dataPlants.filter(plant=>plant.name.toLowerCase().includes(searchText.toLowerCase()))}
            data={dataPlants}
            renderItem={({ item }) => {
              return <Card plant={item} />;
            }}
          />
        )

      }
    </SafeAreaView>
  );
};

const style = StyleSheet.create({
  categoryContainer: {
    flexDirection: 'row',
    marginTop: 30,
    marginBottom: 20,
    justifyContent: 'space-between',
    margin: 30
  },
  categoryText: { fontSize: 18, color: 'grey', fontWeight: 'bold' },
  categoryTextSelected: {
    color: COLORS.green,
    paddingBottom: 5,
    borderBottomWidth: 2,
    borderColor: COLORS.green,
  },
  card: {
    height: 270,
    backgroundColor: COLORS.light,
    width,
    marginHorizontal: 2,
    borderRadius: 10,
    marginBottom: 20,
    padding: 15,
  },
  header: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  searchContainer: {
    height: 50,
    backgroundColor: COLORS.light,
    borderRadius: 10,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    color: COLORS.dark,
  },
  sortBtn: {
    marginLeft: 10,
    height: 50,
    width: 50,
    borderRadius: 10,
    backgroundColor: COLORS.green,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;
