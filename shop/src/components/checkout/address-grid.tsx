import { Address } from "@framework/types";
import { RadioGroup } from "@headlessui/react";
import { useAtom, WritableAtom } from "jotai";
import { useEffect } from "react";
import AddressCard from "@components/address/address-card";
import { AddressHeader } from "@components/address/address-header";
import { useTranslation } from "next-i18next";
import { useUI } from "@contexts/ui.context";
import { verifiedResponseAtom } from "@store/checkout";
import { useCart } from "@store/quick-cart/cart.context";
import { trackAddShippingInfo } from "@lib/analytics";

interface AddressesProps {
  addresses: Address[] | undefined;
  label: string;
  atom: WritableAtom<Address | null, Address>;
  className?: string;
  userId: string;
  count: number;
  type: string;
  isShipping?: boolean
}

export const AddressGrid: React.FC<AddressesProps> = ({
  addresses,
  label,
  atom,
  className,
  userId,
  count,
  type,
  isShipping
}) => {
  const { t } = useTranslation("common");
  const [selectedAddress, setAddress] = useAtom(atom);
  const { openModal, setModalData, setModalView } = useUI();
  const [_, setVerifiedResponse] = useAtom(verifiedResponseAtom);
  const { items: cartItems, total: cartTotal } = useCart();

  if (isShipping) {
    const index = addresses?.findIndex(item => item.id === -1)

    if (index === -1) {
      const obj = {
        id: -1,
        title: t('text-self-pickup'),
        phone_number: '+601155508866',
        address: {
          country: 'Malaysia',
          state: 'Wilayah Persekutuan',
          city: 'Kuala Lumpur',
          zip: '52100',
          street_address: '9, Jalan 35, Desa Jaya',
          phone_number: '+601155508866'
        }
      }
      addresses?.push(obj)
    }
  } else {
    const index = addresses?.findIndex(item => item.id === -1)
    //console.log('isShipping',isShipping,addresses, 'index',index);
    if (index === -1) {
      const obj = {
        id: -1,
        title: t('text-same-delivery'),
        phone_number: '',
        address: {
          country: 'Malaysia',
          state: '',
          city: '',
          zip: '',
          street_address: 'Same as Delivery Details',
          phone_number: ''
        }
      }
      addresses?.push(obj)
    }
  }

  useEffect(() => {
    if (!addresses?.length) {
      // @ts-ignore - jotai atom expects Address | null
      setAddress(null);
      if (isShipping) {
        setVerifiedResponse(null);
      }
      return;
    }

    if (selectedAddress?.id) {
      const index = addresses.findIndex((a) => a.id === selectedAddress.id);

      if (index >= 0) {
        const nextAddress = addresses[index];
        const referenceChanged = nextAddress !== selectedAddress;

        if (referenceChanged) {
          setAddress(nextAddress);
        }

        if (isShipping && selectedAddress?.address && nextAddress?.address) {
          const previousAddress = JSON.stringify(selectedAddress.address);
          const updatedAddress = JSON.stringify(nextAddress.address);

          if (previousAddress !== updatedAddress) {
            setVerifiedResponse(null);
          }
        }

        return;
      }
    }

    const defaultAddress = addresses[0];
    setAddress(defaultAddress);
    if (isShipping) {
      setVerifiedResponse(null);
    }
  }, [
    addresses,
    selectedAddress,
    setAddress,
    isShipping,
    setVerifiedResponse,
  ]);

  const handleAddressChange = (nextAddress: Address) => {
    if (isShipping && nextAddress?.id !== selectedAddress?.id) {
      setVerifiedResponse(null);
    }
    setAddress(nextAddress);
    if (isShipping && cartItems?.length) {
      trackAddShippingInfo({
        items: cartItems,
        value: cartTotal,
        shippingTier: nextAddress?.title ?? nextAddress?.type ?? undefined,
      });
    }
  };

  //TODO: no address found
  function onAdd() {
    setModalData({
      customerId: userId,
      type,
    });
    setModalView("ADDRESS_FORM_VIEW");
    return openModal();
  }

  return (
    <div className={className}>
      <AddressHeader onAdd={onAdd} count={count} label={label} />

      {addresses && addresses?.length ? (
        <RadioGroup value={selectedAddress} onChange={handleAddressChange}>
          <RadioGroup.Label className="sr-only">{label}</RadioGroup.Label>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
            {addresses?.map((address) => (
              <RadioGroup.Option
                value={address}
                key={address.id}
                className="focus-visible:outline-none"
              >
                {({ checked }) => (
                  <AddressCard
                    checked={checked}
                    address={address}
                    userId={userId}
                  />
                )}
              </RadioGroup.Option>
            ))}
          </div>
        </RadioGroup>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
          <span className="text-sm relative p-4 lg:p-5 xl:p-6 text-heading font-semibold text-center bg-gray-200 border-gray-100 rounded border border-border-200">
            {t("text-no-address")}
          </span>
        </div>
      )}
    </div>
  );
};
export default AddressGrid;
