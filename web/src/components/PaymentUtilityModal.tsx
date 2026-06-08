'use client';

import { Modal } from 'flowbite-react';
import { ModalBody, ModalHeader } from 'flowbite-react';
import SendPayment from '@/components/SendPayment';
import type { ToastTone } from '@/components/ToastStack';

export default function PaymentUtilityModal({
  open,
  publicKey,
  onClose,
  onSent,
  onNotify,
}: {
  open: boolean;
  publicKey: string;
  onClose: () => void;
  onSent: () => void;
  onNotify?: (tone: ToastTone, title: string, detail?: string) => void;
}) {
  return (
    <Modal show={open} onClose={onClose} size="xl" popup dismissible>
      <ModalHeader className="border-slate-800 bg-[#111827] text-slate-50">
        Send Test Payment
      </ModalHeader>
      <ModalBody className="bg-[#111827] text-slate-50">
        <SendPayment publicKey={publicKey} onSent={onSent} onNotify={onNotify} />
      </ModalBody>
    </Modal>
  );
}
