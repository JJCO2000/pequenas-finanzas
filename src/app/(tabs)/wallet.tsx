import React from 'react';
import { Redirect } from 'expo-router';
export default function LegacyWallet() { return <Redirect href={'/wallet' as any} />; }
