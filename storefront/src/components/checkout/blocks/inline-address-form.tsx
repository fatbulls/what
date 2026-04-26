"use client";

import { useEffect, useMemo, useState } from "react";
import { useAtom, WritableAtom } from "jotai";
import { useTranslation } from "next-i18next";
import Input from "@components/ui/input";
import TextArea from "@components/ui/text-area";
import { Address } from "@framework/types";

// Malaysian states — matches the set in the legacy modal form.
const STATE_OPTIONS = [
  "W.P. Kuala Lumpur",
  "Selangor",
  "Johor",
  "Kedah",
  "Kelantan",
  "Melaka",
  "Negeri Sembilan",
  "Pahang",
  "Perak",
  "Perlis",
  "Pulau Pinang",
  "Sabah",
  "Sarawak",
  "Terengganu",
  "W.P. Labuan",
  "W.P. Putrajaya",
];

type Values = {
  name: string;
  phone_number: string;
  street_address: string;
  city: string;
  state: string;
  zip: string;
};

function emptyValues(): Values {
  return {
    name: "",
    phone_number: "",
    street_address: "",
    city: "",
    state: "",
    zip: "",
  };
}

function readFromAddress(a: Address | null | undefined): Values {
  if (!a) return emptyValues();
  const inner = (a as any).address ?? {};
  return {
    name: (a as any).title ?? (a as any).name ?? "",
    phone_number: (a as any).phone_number ?? inner.phone_number ?? "",
    street_address: inner.street_address ?? "",
    city: inner.city ?? "",
    state: inner.state ?? "",
    zip: inner.zip ?? "",
  };
}

interface Props {
  atom: WritableAtom<Address | null, Address>;
  savedAddresses?: Address[];
  type: "shipping" | "billing";
}

// Always-visible address form bound directly to the shipping/billing atom.
// No modal, no "Add" button — the fields are the primary input surface.
// If the customer has saved addresses, a compact dropdown at the top
// offers to prefill from one.
const InlineAddressForm: React.FC<Props> = ({ atom, savedAddresses, type }) => {
  const { t } = useTranslation("common");
  const [selected, setSelected] = useAtom(atom);
  const [values, setValues] = useState<Values>(() => readFromAddress(selected));
  const [savedPick, setSavedPick] = useState<string>("");

  const saved = useMemo(
    () =>
      (savedAddresses ?? []).filter((a: any) => a?.id && a?.id !== -1),
    [savedAddresses],
  );

  // Initial sync: if the atom already has an address (e.g. from a prior
  // render) and the form is empty, prefill the form.
  useEffect(() => {
    if (!selected) return;
    const next = readFromAddress(selected);
    setValues((prev) => (prev.street_address || prev.city ? prev : next));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-pick the default saved address (first one) on first mount so
  // the atom is populated even if the user doesn't touch the form.
  useEffect(() => {
    if (selected || saved.length === 0) return;
    pickSaved(String(saved[0].id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saved.length]);

  const commit = (next: Values) => {
    setValues(next);
    // Build the ChawkBazar Address shape the rest of the checkout expects.
    const addr: any = {
      id: (selected as any)?.id ?? `inline-${type}`,
      title: next.name || type,
      type,
      phone_number: next.phone_number,
      address: {
        country: "Malaysia",
        state: next.state,
        city: next.city,
        zip: next.zip,
        street_address: next.street_address,
        phone_number: next.phone_number,
      },
    };
    setSelected(addr);
  };

  const pickSaved = (idStr: string) => {
    setSavedPick(idStr);
    if (!idStr) return;
    const match = saved.find((a) => String(a.id) === idStr);
    if (!match) return;
    commit(readFromAddress(match));
  };

  return (
    <div className="space-y-4">
      {saved.length > 0 && (
        <div>
          <label className="block text-xs font-semibold text-heading mb-1">
            {t("text-use-saved-address", {
              defaultValue: "Use a saved address",
            })}
          </label>
          <select
            value={savedPick}
            onChange={(e) => pickSaved(e.target.value)}
            className="w-full h-11 md:h-12 bg-white border border-gray-300 rounded-md px-3 text-sm focus:outline-none focus:border-heading"
          >
            <option value="">
              {t("text-select-saved-address", {
                defaultValue: "Select a saved address…",
              })}
            </option>
            {saved.map((a: any) => (
              <option key={a.id} value={String(a.id)}>
                {a.title || a.address?.street_address || `#${a.id}`}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <Input
          labelKey={type === "shipping" ? "Recipient name" : "Name"}
          name={`${type}_name`}
          variant="outline"
          value={values.name}
          onChange={(e: any) => commit({ ...values, name: e.target.value })}
        />
        <Input
          labelKey={type === "shipping" ? "Recipient phone" : "Phone"}
          name={`${type}_phone`}
          type="tel"
          variant="outline"
          value={values.phone_number}
          onChange={(e: any) =>
            commit({ ...values, phone_number: e.target.value })
          }
        />
      </div>

      <TextArea
        labelKey="Street address"
        name={`${type}_street`}
        variant="outline"
        rows={2}
        value={values.street_address}
        onChange={(e: any) =>
          commit({ ...values, street_address: e.target.value })
        }
      />

      <div className="grid sm:grid-cols-3 gap-4">
        <Input
          labelKey="City"
          name={`${type}_city`}
          variant="outline"
          value={values.city}
          onChange={(e: any) => commit({ ...values, city: e.target.value })}
        />
        <div>
          <label className="block text-gray-600 font-semibold text-sm leading-none mb-3">
            State
          </label>
          <select
            value={values.state}
            onChange={(e) => commit({ ...values, state: e.target.value })}
            className="w-full h-11 md:h-12 bg-white border border-gray-300 rounded-md px-3 text-sm focus:outline-none focus:border-heading"
          >
            <option value="">Select state</option>
            {STATE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <Input
          labelKey="Postcode"
          name={`${type}_zip`}
          variant="outline"
          value={values.zip}
          onChange={(e: any) => commit({ ...values, zip: e.target.value })}
        />
      </div>
    </div>
  );
};

export default InlineAddressForm;
