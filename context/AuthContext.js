'use client'
import { auth,db } from "@/firebase"
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import React, { useContext,useState,useEffect } from "react"


const AuthContext = React.createContext()

export function useAuth(){
    return useContext(AuthContext)
}


export function AuthProvider({children}) 
{

    const [currentUser,setCurrentUser] = useState(null)
    const[userDataObj,setUserDataObj] = useState(null)
    const[loading,setLoading] = useState(true)


    // Auth Handler
    function signup(email,password){
        return createUserWithEmailAndPassword(auth,email,password)
    } 

    function login(email,password){
        return signInWithEmailAndPassword(auth,email,password)
    }

    function logout()
    {
        setUserDataObj(null)
        setCurrentUser(null)
        return signOut(auth)
    }

    useEffect(()=>{
        const unsubscribe = onAuthStateChanged(auth,async(user) =>{
            try
            {
                // Set the user to our local context state
                setLoading(true)
                setCurrentUser(user)
                if(!user){
                    console.log('no User Found')
                    return
                }
                // if user exist, fetch data from firestore database
                console.log('fetch user data');
                
                const docRef = doc(db,'users',user.uid)
                const docSnap = await getDoc(docRef)
                let firebaseData = {}
                if(docSnap.exists())
                {
                    console.log('found User Data')
                    firebaseData = docSnap.data()
                    console.log(firebaseData);
                    
                }
                setUserDataObj(firebaseData)

            }
            catch(err)
            {
                console.log(err.message)
            }finally{
                setLoading(false)
            }
        })
        return unsubscribe
    },[])

    const value = {
        currentUser,
        userDataObj,
        setUserDataObj,
        signup,
        logout,
        login,
        loading
    }

    return(
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}



