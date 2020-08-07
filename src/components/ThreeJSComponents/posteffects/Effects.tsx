import {useEffect, useMemo} from 'react'
import {useFrame, useThree} from 'react-three-fiber'
import {
    BloomEffect,
    ColorAverageEffect,
    EffectComposer,
    EffectPass,
    GodRaysEffect,
    KernelSize,
    NoiseEffect,
    RenderPass,
    SepiaEffect,
    SMAAEffect,
    SMAAPreset
    //@ts-ignore
} from 'postprocessing'
import {shallowEqual, useSelector} from "react-redux";
import {AppStateType} from "../../../store/store";


const Effects = () => {

    const sun = useSelector((state: AppStateType) => state.appState.sun, shallowEqual);

    const {gl, scene, camera, size} = useThree();

    const composer = useMemo(() => {

        //SMAA
        const areaImage = new Image();
        areaImage.src = SMAAEffect.areaImageDataURL;
        const searchImage = new Image();
        searchImage.src = SMAAEffect.searchImageDataURL;
        const smaaEffect = new SMAAEffect(searchImage, areaImage, SMAAPreset.MEDIUM);

        //bloom
        const bloom = new BloomEffect({
            luminanceThreshold: 0.2,
            luminanceSmoothing: 0,
            resolutionScale: 1
        });
        bloom.blendMode.opacity.value = 2;

        //noise effect
        const noise = new NoiseEffect({premultiply: true});

        //sepia
        const sepia = new SepiaEffect({intensity: 1.0});

        //monochrome
        const monochrome = new ColorAverageEffect();

        //all effects pass
        let effectPass

        if (sun !== null) {
            const godRays = new GodRaysEffect(
                camera, sun, {
                    height: 480,
                    kernelSize: KernelSize.SMALL,
                    density: 0.96,
                    decay: 0.92,
                    weight: 0.3,
                    exposure: 0.54,
                    samples: 60,
                });
            effectPass = new EffectPass(camera, smaaEffect, godRays);
            effectPass.renderToScreen = true;
        } else {
            effectPass = new EffectPass(camera, smaaEffect);
            effectPass.renderToScreen = true;
        }

        //composer
        const composer = new EffectComposer(gl);
        composer.addPass(new EffectPass(camera));
        composer.addPass(new RenderPass(scene, camera));
        composer.addPass(effectPass);

        return composer

    }, [camera, gl, scene, sun]);

    useEffect(() => void composer.setSize(size.width, size.height), [composer, size]);

    return useFrame((_, delta) => composer.render(delta), 1)
};

export default Effects;

