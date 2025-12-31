import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const LoginPromptModal = ({ isOpen, onClose, onLoginClick }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          {/* <DialogTitle>Login Required</DialogTitle> */}
          <DialogTitle>লগইন প্রয়োজন</DialogTitle>
          <DialogDescription>
            {/* You are not currently logged in. */}
            <p>আপনি বর্তমানে লগইন করে নাই তাই আপনি উন্নত সার্চ ও অন্যান্য ব্যক্তিগত ফিচার ব্যবহার করতে পারবেন না।</p>
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {/* <p>To access the advanced search functionality and other personalized features, please log in to your account.</p> */}
          <p>উন্নত সার্চ ও অন্যান্য ব্যক্তিগত ফিচার ব্যবহার করতে হলে অনুগ্রহ করে আপনার অ্যাকাউন্টে লগইন করুন।</p>
          {/* <p className="mt-2">If you log in, you will gain access to:</p> */}
          <p className="mt-2">আপনি যদি লগইন করেন তাহলে আপনি নিম্নলিখিত সকল ফিচার ব্যবহার করতে পারবেন:</p>
          <ul className="list-disc list-inside ml-4">
            {/* <li>Advanced product filtering options</li> */}
            <li>উন্নত প্রোডাক্ট ফিল্টারিং অপশন</li>
            {/* <li>Personalized search history</li> */}
            <li>ব্যক্তিগত সার্চ ইতিহাস</li>
            {/* <li>And more!</li> */}
            <li>এবং আরও অনেক!</li>
          </ul>
        </div>
        <DialogFooter>
          <Button type="button" onClick={onClose}>Close</Button>
          <Button type="button" onClick={onLoginClick}>Login</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LoginPromptModal;
