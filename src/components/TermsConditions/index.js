import { Fragment, useState } from 'react';
import { Box, Dialog, DialogActions, DialogContent, Divider, Grid, Tab, Tabs, Typography } from '@mui/material';
import { FontFamily } from 'assets';
import Colors from 'assets/Style/Colors';
import { PrimaryButton } from 'components/Buttons';
import { makeStyles } from '@mui/styles';

const useStyle = makeStyles({
  text: {
    margin: '8px 0px',
    color: Colors.smokeyGrey,
    fontFamily: FontFamily.NunitoRegular
  },
  textAr: {
    textAlign: 'right'
  },
})

function TermsConditions({ open, close }) {

  const classes = useStyle();

  const [activeTab, setActiveTab] = useState(0);

  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Dialog
      open={open}
      sx={{ '& .MuiDialog-paper': { borderRadius: 2, py: 2, px: 3 }, '& .MuiTab-root': { minWidth: 150 } }}
    >
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleChange}>
          <Tab label="English" />
          <Tab label="Arabic" />
          <Tab label="Russian" />
        </Tabs>
      </Box>
      <DialogContent>
        <Typography variant="h5" sx={{ textAlign: 'center', mb: 2, fontFamily: FontFamily.NunitoRegular }}>
          {activeTab === 1 ? 'عقد اتفاقية' : activeTab === 2 ? 'Условия использования' : 'Terms & Conditions'}
        </Typography>
        {activeTab === 0 &&
          <Fragment>
            <Typography variant="body2" className={classes.text}>
              Second party is responsible to make the payments to the auctions thru legal financial entities.
            </Typography>
            <Typography variant="body2" className={classes.text}>
              Any unsecure payment may cause difficulties in loading the vehicles second party will be
              responsible.
            </Typography>
            <Typography variant="body2" className={classes.text}>
              First Party will provide buyers to second party as per his business requirements.
            </Typography>
            <Typography variant="body2" className={classes.text}>
              First party is responsible to load the second party vehicles mix with the first party containers.
            </Typography>
            <Typography variant="body2" className={classes.text}>
              Transit time is subject to the shipping line ETA and subject to change according to the shipping
              line schedules as GWWS has no power in changing ETA And bare no responsibility in case of any
              ship delay.
            </Typography>
            <Typography variant="body2" className={classes.text}>
              Galaxy must have 3 working days to pick up the vehicales after payment is done , after these days
              any storages will be under the responsibilty of GWWS.
            </Typography>
            <Typography variant="body2" className={classes.text}>
              Any vehicle key missed in the auction GWWS is not responsible .
            </Typography>
            <Typography variant="body2" className={classes.text}>
              Any car damaged in the auction GWWS is not responsible to cover the damage.
            </Typography>
            <Typography variant="body2" className={classes.text}>
              Second party must compare the damages as per the shipping photos not with the auction photos.
            </Typography>
            <Typography variant="body2" className={classes.text}>
              GWWS is not responsible for any missing CATALYST CONVERTER .
            </Typography>
            <Typography variant="body2" className={classes.text}>
              Offsite and sublot locations GWWS is not responsible for any storage in case of late pick up
            </Typography>
            <Typography variant="body2" className={classes.text}>
              Galaxy Worldwide shipping is not responsible for any delay from the auction in providing the titles.
            </Typography>
            <Typography variant="body2" className={classes.text}>
              Rates will be calculated from Loading date Galaxy is not responsible for any Vessels delay.
            </Typography>
            <Typography variant="body2" className={classes.text}>
              The second party must pay the shipping charges before receiving the vehicle document from first
              party office.
            </Typography>
            <Typography variant="body2" className={classes.text}>
              First party will not charge custom duty for 150 days from arrival unless vehicle for scrap or local
              registration
            </Typography>
            <Typography variant="body2" className={classes.text}>
              If second party like to stop the work, they must clear the outstanding balance before receiving the
              vehicles.
            </Typography>
            <Typography variant="body2" className={classes.text}>
              In case of damages occurred during the shipping the first party must cover the damage based on
              the local market rates. but in case the car got burned or stollen in or from the first party warehouses,
              the first party must refund the value of the car based on purchase invoice.
            </Typography>
            <Typography variant="body2" className={classes.text}>
              First party will offer to second party 20 days parking free after the arrival of the vehicle after that
              300 AED monthly will be charged as yard storages in UAE
            </Typography>
            <Typography variant="body2" className={classes.text}>
              Second party must follow the announcements received from first party.
            </Typography>
            <Typography variant="body2" className={classes.text}>
              Rates will be updated monthly and shared with the second party.
            </Typography>
            <Typography variant="body2" className={classes.text}>
              In case the vehicle was lost based on careless work from the first party team, then second party
              has the right to ask to recover the car value plus little profit will be decided by first party.
            </Typography>
            <Typography variant="body2" className={classes.text}>
              First party must provide account for second party on company application.
            </Typography>
            <Typography variant="body2" className={classes.text}>
              Second party has to bare the full responsibilities for the auction storages in case he didn’t follow
              the announcements which has been sent from first party team.
            </Typography>
            <Typography variant="body2" className={classes.text}>
              First party responsible for inspection charges either in US or in UAE.
            </Typography>
            <Typography variant="body2" className={classes.text}>
              Both parties have the right to disconnect the agreement in case any of them didn’t follow the
              agreed terms.
            </Typography>
            <Typography variant="body2" className={classes.text}>
              In case second party wants to buy vehicles from Canadian auctions he must ask if the accounts
              he is using will allow him to buy or he needs another account to claim the tax back.
            </Typography>
            <Typography variant="body2" className={classes.text}>
              Kindly review the attachment of big vehicle SUV that we will add 150$.
            </Typography>
            <Typography variant="body2" className={classes.text}>
              The first party can add more terms based on the business requirements on this agreement, but
              He has to inform the second party.
            </Typography>
            <Typography variant="body2" className={classes.text}>
              The fees for issuing exportable title in US is 300$
            </Typography>
            <Typography variant="body2" className={classes.text}>
              Payments to broker accounts must be in Galaxy office.
            </Typography>
          </Fragment>
        }
        {activeTab === 1 &&

          <Fragment>



            <>
              <Typography variant="body2" className={[classes.text, classes.textAr]}>
                ١.	الطرف الثاني مسؤول عن سداد المدفوعات للمزادات عن طريق حوالة الى مكتب حوالات في دبي او نقدا داخل الشركة
              </Typography>

              <Typography variant="body2" className={[classes.text, classes.textAr]}>
                ٢.	أي مدفوعات قد تسبب صعوبات في تحميل المركبات سيكون الطرف الثاني مسؤولاً
              </Typography>

              <Typography variant="body2" className={[classes.text, classes.textAr]}>
                ٣.	سيوفر الطرف الأول حسابات المزادات للطرف الثاني وفقًا لمتطلبات عمله
              </Typography>

              <Typography variant="body2" className={[classes.text, classes.textAr]}>
                ٤.	الطرف الأول مسؤول عن تحميل سيارات الطرف الثاني مشترك ضمن حاويات الطرف الاول
              </Typography>

              <Typography variant="body2" className={[classes.text, classes.textAr]}>
                ٥.	مواعيد وصول الحاويات قد تتبدل من قبل شركة النقل البحري ولا يملك الطرف الأول أي قدرة على تغيرها وايضاً لا يتحمل الطرف الأول أي مسؤولية عن هذا التأخير
              </Typography>

              <Typography variant="body2" className={[classes.text, classes.textAr]}>
                ٦.	الطرف الأول لديه ٣ أيام عمل لسحب المركبات من المزاد بعد إتمام عملية الدفع، وبعدها يكون الطرف الأول مسؤول عن الغرامات الا إذا تم ارسال أي تعميم مسبق بعدم الشراء من بعض الأماكن التي توجد فيها مشاكل في التحميل
              </Typography>

              <Typography variant="body2" className={[classes.text, classes.textAr]}>
                ٧.	الطرف الأول غير مسؤول عن أي مفتاح مركبة لم يتم تسليمه من قبل المزاد
              </Typography>

              <Typography variant="body2" className={[classes.text, classes.textAr]}>
                ٨.	أي سيارة تضررت في المزاد الطرف الأول غير مسؤول عن التعويض
              </Typography>

              <Typography variant="body2" className={[classes.text, classes.textAr]}>
                ٩.	يجب على الطرف الثاني مقارنة الأضرار حسب صور الشحن وليس صور المزاد
              </Typography>

              <Typography variant="body2" className={[classes.text, classes.textAr]}>
                ١٠.	الطرف الأول غير مسؤول عن أي فقدان محوّل المركبة في حالة عدم وجود ما يثبت انه موجود
              </Typography>

              <Typography variant="body2" className={[classes.text, classes.textAr]}>
                ١١.	في حال شراء مركبات من المزادات، ولكن المركبة في مكان اخر فإن الطرف الأول غير مسؤول عن الغرامات في حال ترتبت على المركبة
              </Typography>

              <Typography variant="body2" className={[classes.text, classes.textAr]}>
                ١٢.	الطرف الأول غير مسؤول عن أي تأخير من قبل المزاد في ارسال ملكية المركبة للتحميل
              </Typography>

              <Typography variant="body2" className={[classes.text, classes.textAr]}>
                ١٣.	سيتم احتساب الأسعار اعتبارًا من تاريخ التحميل، ولا تتحمل شركة المجرة المسؤولية عن أي تأخير من قبل شركات الشحن البحري
              </Typography>

              <Typography variant="body2" className={[classes.text, classes.textAr]}>
                ١٤.	يجب على الطرف الثاني دفع مصاريف الشحن للسيارات قبل استلام الملكية
              </Typography>

              <Typography variant="body2" className={[classes.text, classes.textAr]}>
                ١٥.	لن يقوم الطرف الأول بفرض رسوم جمركية لمدة 150 يومًا من الوصول ما لم تكن السيارة للخردة أو التسجيل المحلي
              </Typography>

              <Typography variant="body2" className={[classes.text, classes.textAr]}>
                إذا رغب الطرف الثاني في إيقاف العمل، فيجب عليه تسوية رصيد الشحن المستحق قبل استلام المركبات.
              </Typography>

              <Typography variant="body2" className={[classes.text, classes.textAr]}>
                في حال تضرر أي مركبة داخل الحاوية، يكون الطرف الأول مسؤولًا عن التعويض حسب سعر السوق.
              </Typography>

              <Typography variant="body2" className={[classes.text, classes.textAr]}>
                يقدم الطرف الأول موقفًا مجانيًا لمدة 35 يومًا من تاريخ وصول المركبة، وبعد ذلك يتم احتساب مبلغ 10 دراهم عن كل يوم إضافي.
              </Typography>

              <Typography variant="body2" className={[classes.text, classes.textAr]}>
                ١٦.	إذا رغب الطرف الثاني في إيقاف العمل، فيجب عليه تصفية رصيد الشحن المستحق قبل استلام المركبات
              </Typography>

              <Typography variant="body2" className={[classes.text, classes.textAr]}>
                ١٧.	في حال تضرر أي مركبة داخل الحاوية فأن الطرف الأول مسؤول عن التعويض حسب سعر السوق، ولا يمكن ارجاع المركبة او التعويض عن الخسائر، اما في حال حريق السيارة داخل المستودعات او سرقاتها داخل مخازن الطرف الأول فيتوجب عليه إعادة قيمة شراء السيارة حسب فاتورة المزاد
              </Typography>

              <Typography variant="body2" className={[classes.text, classes.textAr]}>
                ١٨.	يقدم الطرف الأول موقف مجاني لمدة ٣٥ يوماً من تاريخ وصول المركبة من بعدها يتم احتساب مبلغ ١٠ درهم عن كل يوم ارضيات
              </Typography>

              <Typography variant="body2" className={[classes.text, classes.textAr]}>
                ١٩.	يجب على الطرف الثاني الالتزام الكامل بالتعاميم المرسلة من الطرف الأول
              </Typography>

              <Typography variant="body2" className={[classes.text, classes.textAr]}>
                ٢٠.	يجب على الطرف الثاني أرسل قيمة شراء المركبة كاملاً حسب فاتورة المزاد
              </Typography>

              <Typography variant="body2" className={[classes.text, classes.textAr]}>
                ٢١.	يجب على الطرف الأول تحديث قائمة الأسعار شهريا وارسالها الى الطرف الثاني مع ضرورة إبلاغه يتم تحديث الأسعار شهريًا. عن أوضاع الموانئ والمستودعات
              </Typography>

              <Typography variant="body2" className={[classes.text, classes.textAr]}>
                ٢٢.	في حال فقدان السيارة بتقصير من قبل الطرف الأول، فيحق للطرف الثاني المطالبة بتعويض عن قيمة شراء السيارة بالإضافة الى ربح بسيط يحدده الطرف الأول
              </Typography>

              <Typography variant="body2" className={[classes.text, classes.textAr]}>
                ٢٣.	يجب على الطرف الأول توفير حساب على تطبيق شركة المجرة للطرف الثاني لتتبع سيارته
              </Typography>

              <Typography variant="body2" className={[classes.text, classes.textAr]}>
                ٢٤.	يجب أن يتم الدفع للسيارات الكندية من خلال مكتب شركة المجرة فقط
              </Typography>

              <Typography variant="body2" className={[classes.text, classes.textAr]}>
                ٢٥.	يجب أن يتم الدفع لمزادات الولايات المتحدة الأمريكية الأخرى من خلال مكتب شركة المجرة
              </Typography>

              <Typography variant="body2" className={[classes.text, classes.textAr]}>
                ٢٦.	الطرف الثاني مسؤول عن دفع رسوم التجديد السنوية للحسابات التي يستخدمها والتي تخص الطرف الأول
              </Typography>

              <Typography variant="body2" className={[classes.text, classes.textAr]}>
                ٢٧.	يجب على الطرف الثاني تحمل كامل غرامات المزادات في حال عدم الالتزام بالتعميم المرسلة
              </Typography>
              <Typography variant="body2" className={[classes.text, classes.textAr]}>
                ٢٨.	يتحمل الطرف الأول مصاريف تفتيش الحاويات من قبل الجمارك الأمريكية او الإماراتية
              </Typography>

              <Typography variant="body2" className={[classes.text, classes.textAr]}>
                ٢٩.	يحق لكلا الطرفين فسخ العقد في حال عدم التزام الطرف الاخر بالبنود المذكورة
              </Typography>

              <Typography variant="body2" className={[classes.text, classes.textAr]}>
                ٣٠.	يجب تقييم الاضرار قبل انتهاء ٢٥ يوماً من تاريخ الوصول والا لا تتحمل شركة المجرة أي مسؤولية عن الاضرار
              </Typography>

              <Typography variant="body2" className={[classes.text, classes.textAr]}>
                ٣١.	في حال يريد الطرف الثاني الشراء من المزادات الكندية يتوجب عليه السؤال عن الحسابات الموجودة لديه من قبل الشركة، هل يمكنه الشراء او يحتاج لحسابات أخرى لنتمكن من استرجاع الضرائب
              </Typography>

              <Typography variant="body2" className={[classes.text, classes.textAr]}>
                ٣٢.	يرجى مراجعة المرفقات من الطرف الثاني فيما يخص السيارات الكبيرة التي يتم إضافة $ ١٥٠
              </Typography>

              <Typography variant="body2" className={[classes.text, classes.textAr]}>
                ٣٣.	في حال لم يستعمل الطرف الثاني الحسابات لمدة شهر متواصل فيحق للطرف الأول سحبها منه
              </Typography>
              <Typography variant="body2" className={[classes.text, classes.textAr]}>
                ٣٤.	يمكن للطرف الأول إضافة بنود حسب مستجدات العمل على هذا الاتفاق، ولكن يتوجب عليه اخطار الطرف الثاني
              </Typography>
              <Typography variant="body2" className={[classes.text, classes.textAr]}>
                ٣٥.	رسوم اصدار أوراق للمركبات المشتراة من المزادات الامريكية  $ ٣٠٠
              </Typography>
              <Typography variant="body2" className={[classes.text, classes.textAr]}>
              ٣٦.	ممنوع تسديد المركبات المشتراة من حسابات بروكر الّا عن طريق مكتب الشركة
              </Typography>
            </>

          </Fragment>
        }
        {activeTab === 2 &&
          <Fragment>
            <Typography variant="body2" className={classes.text}>
              Вторая сторона несет ответственность за осуществление платежей на аукционах через юридические финансовые
              лица.
            </Typography>
            <Typography variant="body2" className={classes.text}>
              Любой незащищенный платеж может вызвать трудности с загрузкой транспортных средств, вторая сторона
              будет ответственным
            </Typography>
            <Typography variant="body2" className={classes.text}>
              Первая сторона предоставит акаунты второй стороны в соответствии с его бизнес-требованиями.
            </Typography>
            <Typography variant="body2" className={classes.text}>
              Первая сторона несет ответственность за погрузку транспортных средств второй стороны в контейнеры первой
              стороны.
            </Typography>
            <Typography variant="body2" className={classes.text}>
              Время в пути зависит от ETA судоходной линии и может быть измененым в зависимости от
              доставки.Расписания линий, поскольку GWWS не имеет права изменять расчетное время прибытия и не несет
              ответственность в случае каких-либо задержек корабля
            </Typography>
            <Typography variant="body2" className={classes.text}>
              У Galaxy должно быть 3 рабочих дня, чтобы забрать автомобиль после оплаты, после этих дней, любые
              хранилища будут находиться под ответственностью GWWS.
            </Typography>
            <Typography variant="body2" className={classes.text}>
              Любой ключ автомобиля, потерянный на аукционе, GWWS не несет ответственность
            </Typography>
            <Typography variant="body2" className={classes.text}>
              Любой автомобиль, поврежденный на аукционе, GWWS не несет ответственность за возмещение ущерба
            </Typography>
            <Typography variant="body2" className={classes.text}>
              Вторая сторона должна сравнить повреждения в соответствии с фотографиями доставки, а не с фотографиями
              аукциона
            </Typography>
            <Typography variant="body2" className={classes.text}>
              GWWS не несет ответственность за отсутствие КАТАЛИЗАТОРНОГО ПРЕОБРАЗОВАТЕЛЯ.
            </Typography>
            <Typography variant="body2" className={classes.text}>
              Вне площадки (offsite or sublot) GWWS не несет ответственность за хранение в случае поздней доставки
            </Typography>
            <Typography variant="body2" className={classes.text}>
              Galaxy Worldwide Shipping не несет ответственность за любые задержки с предоставлением документов с
              аукциона.
            </Typography>
            <Typography variant="body2" className={classes.text}>
              Тарифы будут рассчитываться с даты погрузки. Galaxy не несет ответственность за задержку судов
            </Typography>
            <Typography variant="body2" className={classes.text}>
              Вторая сторона должна оплатить стоимость доставки до получения документа транспортного средства от офиса
              первой стороны
            </Typography>
            <Typography variant="body2" className={classes.text}>
              Первая сторона не будет взимать таможенную пошлину в течение 150 дней с момента прибытия, если только
              транспортное средство не предназначено для утилизации или местного пользования.
            </Typography>
            <Typography variant="body2" className={classes.text}>
              Он должен сообщить второй стороне.- Сборы за выдачу экспортного документа в США составляют
              300 долларов США.
            </Typography>
            <Typography variant="body2" className={classes.text}>
              Платежи на брокерские счета должны быть в офисе Galaxy.
            </Typography>
            <Typography variant="body2" className={classes.text}>
              Если вторая сторона хочет остановить работу, она должна погасить непогашенный остаток до
              получения транспортных средств
            </Typography>
            <Typography variant="body2" className={classes.text}>
              В случае повреждений, возникших во время транспортировки, первая сторона должна возместить
              ущерб в соответствии с местными рыночными ставками. Но в случае, если автомобиль был сожжен
              или украден на складе первой стороны или со склада первой стороны, первая сторона должна
              возместить стоимость автомобиля на основании счета-фактуры
            </Typography>
            <Typography variant="body2" className={classes.text}>
              Первая сторона предложит второй стороне бесплатную парковку в течение 20 дней после прибытия
              автомобиля, после чего ежемесячно будет взиматься плата в размере 300 дирхамов ОАЭ за парковку во
              дворе в ОАЭ
            </Typography>
            <Typography variant="body2" className={classes.text}>
              Вторая сторона должна следить за объявлениями, полученными от первой стороны.
            </Typography>
            <Typography variant="body2" className={classes.text}>
              Тарифы будут обновляться ежемесячно и передаваться второй стороне.
            </Typography>
            <Typography variant="body2" className={classes.text}>
              В случае утраты транспортного средства из-за небрежной работы бригады первой стороны, вторая
              сторона имеет право потребовать возмещения стоимости автомобиля плюс небольшая прибыль,
              которая будет решаться первой стороной.
            </Typography>
            <Typography variant="body2" className={classes.text}>
              Первая сторона должна предоставить учетную запись для второй стороны по заявлению компании.
            </Typography>
            <Typography variant="body2" className={classes.text}>
              Вторая сторона должна нести полную ответственность за аукционные хранилища в случае, если она
              не последовалаобъявлению, которые были отправлены от команды первой стороны.
            </Typography>
            <Typography variant="body2" className={classes.text}>
              Первая сторона, ответственная за оплату инспекции либо в США, либо в ОАЭ.
            </Typography>
            <Typography variant="body2" className={classes.text}>
              Обе стороны имеют право расторгнуть договор в случае, если какая-либо из них не выполнила
              согласованные условия.
            </Typography>
            <Typography variant="body2" className={classes.text}>
              В случае, если вторая сторона хочет купить транспортные средства на канадских аукционах, она
              должна спросить, есть ли счета которыеон использует, позволит ему покупать, или ему нужна другая
              учетная запись, чтобы потребовать возврата налога.
            </Typography>
            <Typography variant="body2" className={classes.text}>
              Пожалуйста, ознакомьтесь с приложением больших внедорожниках, которое мы добавим 150 $.-
              Первая сторона может добавить дополнительные условия в зависимости от бизнес-требований к
              настоящему соглашению, но Искренне.
            </Typography>
          </Fragment>
        }
        <DialogActions sx={{ mt: 2 }}>
          <PrimaryButton
            title="Accept"
            onClick={() => close()}
          />
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}

export default TermsConditions