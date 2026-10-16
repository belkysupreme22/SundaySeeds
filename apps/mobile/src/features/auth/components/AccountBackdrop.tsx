import Svg, { G, Path } from 'react-native-svg';

/** Separate contours traced from reference-03's centre and right auth panels. */
export function AccountBackdrop({ signup }: { signup: boolean }) {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 240 240"
      preserveAspectRatio="none"
      accessible={false}
    >
      <Path
        d={
          signup
            ? 'M240 240H119C61 240 20 201 20 145C20 103 44 66 83 47L95 66L89 39L125 25L138 55L158 25L190 36L179 67L216 54L240 87Z'
            : 'M240 240H57C39 237 31 225 33 204C34 188 43 173 51 158L43 151L65 120L75 130L89 105L100 116L118 82L128 99L150 78L163 101L177 82L200 89L195 107L218 99L240 113Z'
        }
        fill={signup ? '#FFED8D' : '#DCD3FA'}
        stroke="#26212E"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <G fill="none" stroke="#19171D" strokeWidth="2" strokeLinecap="round">
        {signup ? (
          <Path d="M11 145L3 142M18 134L12 126M28 129L25 120" />
        ) : (
          <Path d="M20 179L12 181M24 168L17 163M32 163L29 154M211 42L214 32M220 49L230 46M201 40L198 32" />
        )}
      </G>
      <Path
        d="M28 27L36 35M36 27L28 35"
        fill="none"
        stroke="#BDA9EA"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </Svg>
  );
}
