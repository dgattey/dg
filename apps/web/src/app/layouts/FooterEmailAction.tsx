'use client';

import { Check } from 'lucide-react';
import { type MouseEvent, useEffect, useState } from 'react';
import { PaperButton } from '../collage/PaperButton';

const CHAR_CODE_SHIFT = 7;

function decodeShiftedCodes(codes: ReadonlyArray<number>): string {
  return String.fromCharCode(...codes.map((code) => code - CHAR_CODE_SHIFT));
}

function reverseDecodeShiftedCodes(codes: ReadonlyArray<number>): string {
  return String.fromCharCode(...[...codes].reverse().map((code) => code - CHAR_CODE_SHIFT));
}

type FooterEmailActionProps = {
  encodedEmail: ReadonlyArray<number>;
};

export function FooterEmailAction({ encodedEmail }: FooterEmailActionProps) {
  const [decodedEmail, setDecodedEmail] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setDecodedEmail(decodeShiftedCodes(encodedEmail));
  }, [encodedEmail]);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const handleEmailClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!decodedEmail) {
      event.preventDefault();
      const email = decodeShiftedCodes(encodedEmail);
      window.location.href = `mailto:${email}`;
    }
  };

  const handleCopy = async () => {
    const email = decodedEmail ?? decodeShiftedCodes(encodedEmail);
    try {
      await navigator.clipboard?.writeText(email);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="chrome__helloEmailRow">
      <a
        aria-label={decodedEmail ? `Email ${decodedEmail}` : 'Email Dylan Gattey'}
        className="chrome__emailLink"
        href={decodedEmail ? `mailto:${decodedEmail}` : '#'}
        onClick={handleEmailClick}
      >
        {decodedEmail ? (
          decodedEmail
        ) : (
          <span aria-hidden="true" className="chrome__emailObfuscated">
            {reverseDecodeShiftedCodes(encodedEmail)}
          </span>
        )}
      </a>
      <div className="collageLift">
        <PaperButton onClick={handleCopy} tiltDeg={-1.5} tone="ochre">
          {copied ? (
            <>
              <Check aria-hidden={true} size={18} strokeWidth={3} />
              Copied
            </>
          ) : (
            <>
              Copy<span className="chrome__srOnly"> email address</span>
            </>
          )}
        </PaperButton>
      </div>
    </div>
  );
}
