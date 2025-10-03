import { View, Text ,ImageBackground,Image} from 'react-native'
import React from 'react'
import {Tabs} from 'expo-router'
import { images } from '@/constants/images'
import { icons } from '@/constants/icons';


const TabIcon = ({focused,icon,text}:any) =>{

    

      if(focused){
          return(
             <ImageBackground source={images.nav_highlight} className="flex flex-row  flex-1 min-w-[85px] min-h-24 mt-[12px] justify-center items-center overflow-hidden">
                    <Image source={icon} tintColor="#16A34A" className="size-6" />
                    <Text className="text-[#16A34A] text-base font-semibold ml-2">
                         {text}
                    </Text>
                 </ImageBackground>
          )
      }
    return(
        <View className="size-full justify-center items-center mt-4 rounded-full">
            <Image source={icon} tintColor="#ffffff" className="size-6 " />
        </View>
    )
      

}

const TabsLayout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel:false,
        tabBarItemStyle : {
        width:"100%",
        height:"100%",
        justifyContent:"center",
        alignItems:"center",
      },
      tabBarStyle: {
        backgroundColor: "#193326",
        height: 50,
        position: "absolute",
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#0F0D23",
      },

    }}>
      <Tabs.Screen
         name="index"
         options={{
            title : "Home" ,
            headerShown : false, 
            tabBarIcon:({focused}) => (
                <TabIcon  
                   focused = {focused} 
                   icon = {icons.home} 
                   text ="Home"
                />
            )   
        }}
      />

      <Tabs.Screen
         name="donation"
         options={{
            title : "Donate" ,
            headerShown : false, 
            tabBarIcon:({focused}) => (
                <TabIcon  
                   focused = {focused} 
                   icon = {icons.donate_n} 
                   text ="Donate"
                />
            )      
        }}
      
      />

      <Tabs.Screen
         name="project"
         options={{
            title : "Project" ,
            headerShown : false, 
            tabBarIcon:({focused}) => (
                <TabIcon  
                   focused = {focused} 
                   icon = {icons.project} 
                   text ="Project"
                />
            )      
        }}
      
      />

      <Tabs.Screen
         name="trackEnergy"
         options={{
            title : "Track" ,
            headerShown : false, 
            tabBarIcon:({focused}) => (
                <TabIcon  
                   focused = {focused} 
                   icon = {icons.track} 
                   text ="Track"
                />
            )      
        }}
      
      />

      <Tabs.Screen
         name="profile"
         options={{
            title : "Profile" ,
            headerShown : false, 
            tabBarIcon:({focused}) => (
                <TabIcon  
                   focused = {focused} 
                   icon = {icons.profile} 
                   text ="Profile"
                />
            )      
        }}
      
      />


    </Tabs>
  )
}

export default TabsLayout