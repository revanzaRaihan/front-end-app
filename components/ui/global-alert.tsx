

"use client";


import { createContext, useContext, useState, ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


type AlertType = "default" | "destructive";


interface AlertState {
 visible: boolean;
 type: AlertType;
 title: string;
 message: string;
}


interface AlertContextValue {
 showAlert: (type: AlertType, title: string, message: string) => void;
}


const AlertContext = createContext<AlertContextValue | undefined>(undefined);


export function AlertProvider({ children }: { children: ReactNode }) {
 const [alert, setAlert] = useState<AlertState>({
   visible: false,
   type: "default",
   title: "",
   message: "",
 });


 const showAlert = (type: AlertType, title: string, message: string) => {
   setAlert({ visible: true, type, title, message });
   setTimeout(() => {
     setAlert((prev) => ({ ...prev, visible: false }));
   }, 3000);
 };


 return (
   <AlertContext.Provider value={{ showAlert }}>
     {alert.visible && (
       <div className="fixed top-4 right-4 z-50 w-96">
         <Alert variant={alert.type}>
           <AlertTitle>{alert.title}</AlertTitle>
           <AlertDescription>{alert.message}</AlertDescription>
         </Alert>
       </div>
     )}
     {children}
   </AlertContext.Provider>
 );
}


export function useAlert() {
 const context = useContext(AlertContext);
 if (!context) throw new Error("useAlert must be used within an AlertProvider");
 return context;
}